/**
 * Copyright 2019, Dynatrace
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ISource, IGrader, IRunResult, IPerfspec, IOptions, IDatastore } from '../types';
import { Indicator } from './Indicator';

export class Pitometer {

  private sources: ISource[] = [];
  private indicators: Indicator[] = [];
  private graders: IGrader[] = [];
  private testContext : string;
  private testRunId : string;
  private options : IOptions;
  private datastoreAccess : IDatastore; 

  constructor() {
  }

  public setDatastore(datastoreAccess: IDatastore) {
    this.datastoreAccess = datastoreAccess;
  }

  /**
   * Adds a metrics source
   *
   * @param id The source ID as referenced in the performance specification
   * @param source The source plugin
   */
  public addSource(id: string, source: ISource): Pitometer {
    this.sources[id] = source;
    return this;
  }

  /**
   * Adds a grader
   * @param type The grader tyoe as referenced in the performance specification
   * @param grader The grader plugin
   */
  public addGrader(type: string, grader: IGrader): Pitometer {
    this.graders[type] = grader;
    return this;
  }

  /**
   * Validating options
   * @param options 
   */
  private setOptions(options: IOptions) {
    this.options = options;
    var lastIndex = options.context.lastIndexOf("/")
    if(lastIndex > 0) {
      this.testRunId = options.context.substring(lastIndex+1);
      this.testContext = options.context.substring(0, lastIndex);
    } else {
      this.testContext = options.context;
      this.testRunId = new Date().toUTCString();
    }
  }

  public getOptions() : IOptions {
    return this.options;
  }

  public getTestContext() : string {
    return this.testContext;
  }

  public getTestRunId() : string {
    return this.testRunId;
  }

  /**
   * Queries the results based on the given test context information
   * @param options 
   */
  public async query(options: IOptions): Promise<IRunResult[]> {
    this.setOptions(options);

    return new Promise((resolve,reject) => {
      if(this.datastoreAccess) {
        this.datastoreAccess.pullFromDatabase(function(err, pulledResults) {
          if(pulledResults) resolve(pulledResults);
          else reject("couldnt read from database: " + err);
        });  
      } else reject("no datastore specified");
    });
  }

  /**
   * 
   * @param spec 
   * @param options 
   */
  private async doRun(spec: IPerfspec, options: IOptions, compareResult: IRunResult): Promise<IRunResult>  {
    // 1: Set the data source and graders per indicator!
    spec.indicators.forEach((idcdef) => {
      const indicator = new Indicator(idcdef);
      if (this.sources[idcdef.source]) {
        const src: ISource = this.sources[idcdef.source];
        src.setOptions(options);
        indicator.setSource(src);
        const grader: IGrader = this.graders[idcdef.grading.type];
        grader.setOptions(options);
        indicator.setGrader(grader);
        this.indicators[idcdef.id] = indicator;
      }
    });

    // 2: Call the Indicator.get method to get the actual result
    const promisedResults = Object.keys(this.indicators).map((key) => {
      const indicator = this.indicators[key];

      // console.log(JSON.stringify(compareResult));

      // If we have results from a previous run, find the results of this indicator!!
      var indicatorResult = null;
      if(compareResult && compareResult.indicatorResults) {
        for(var indResultIx=0;indResultIx<compareResult.indicatorResults.length;indResultIx++) {
          if(compareResult.indicatorResults[indResultIx].id == key) {
            indicatorResult = compareResult.indicatorResults[indResultIx];
            break;
          }
        }
      }

      return indicator.get(options.context, indicatorResult);
    });

    const indicatorResults = await Promise.all(promisedResults);

    // 3: calculate the total score
    const totalScore = indicatorResults.reduce((total, result) => {
      if (!result) return total;
      return total + result.score;
    }, 0);

    // 4: Validate total score with our objectives and define final result string, e.g: pass, warning, fail
    const objectives = spec.objectives;
    var runResult : IRunResult;
    var now = new Date();
    var timestamp = +now;
    var resultString = 'fail';
    if (objectives.pass <= totalScore) {
      resultString = 'pass';
    } else if (objectives.warning <= totalScore) {
      resultString = 'warning';
    }

    runResult = {
      options,
      timestamp,
      testContext: this.testContext,
      testRunId: this.testRunId,
      totalScore,
      objectives,
      indicatorResults,
      result: resultString,
    };

    return new Promise((resolve,reject) => {
      // 5: (optional)write our result to the database
      if(this.datastoreAccess) {
        this.datastoreAccess.writeToDatabase(runResult, function(err, result) {
          if(err) reject("couldnt write to database: " + err);
          else resolve(runResult);
        });  
      } else resolve(runResult);
    });
  }

  /**
   * Executes a Monspec definition
   *
   * @param spec The monspec as object
   * @param options An option object
  */
  public async run(spec: IPerfspec, options: IOptions): Promise<IRunResult> {

    this.setOptions(options);
    const pitometer = this;

    const returnPromise:Promise<IRunResult> = new Promise(function(resolve, reject) {
      // pull compare data from datastore in case its requested via compareContext
      if(options.compareContext && options.compareContext != null && pitometer.datastoreAccess) {
        pitometer.datastoreAccess.pullFromDatabase(function(err, result) {
          if(err) {
            throw err;
          }

          var runPromise: Promise<IRunResult> = null;
          // lets see if we found a result to compare with - otherwise we just run wihtout a comparision, e.g: when the first build happens
          if(!result || result.length == 0) {
            runPromise = pitometer.doRun(spec, options, null);
          } else {
            // lets pass in the first result as right now we ONLY SUPPORT comparison of a single run
            runPromise = pitometer.doRun(spec, options, result[0]);
          }

          runPromise.then(function(value) {
            resolve(value);
          });
        })
      } else {
        pitometer.doRun(spec, options, null).then(function(value) {
          resolve(value);
        });
      }
    });

    return returnPromise;
  }
}