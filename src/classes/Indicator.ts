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

import { ISource, IGrader, IGradingDefinition, IIndicatorDefinition, ISourceResult } from '../types';

export class Indicator {
  source: ISource;
  id: string;
  query: any;
  grading: IGradingDefinition;
  metadata: any;
  grader: IGrader;
  results : ISourceResult[] | boolean;

  /**
   * Constructor
   *
   * @param indicatorDefinition
   */
  constructor(indicatorDefinition: IIndicatorDefinition) {
    this.id = indicatorDefinition.id;
    this.query = indicatorDefinition.query;
    this.grading = indicatorDefinition.grading;
    this.metadata = indicatorDefinition.metadata;
  }

  /**
   * Sets a source
   *
   * @param source
   */
  setSource(source: ISource) {
    this.source = source;
  }

  /**
   * Sets a grade
   *
   * @param grader
   */
  setGrader(grader: IGrader) {
    this.grader = grader;
  }

  /**
   * Fetch and grade metrics
   * @param context The optional context that was passed to the run function
   */
  async get(context = '', compareResult = null) {
    this.results = await this.source.fetch(this.query);
    const grade = this.grader.grade(this.id, this.results, this.grading, compareResult);
    return grade;
  }
}
