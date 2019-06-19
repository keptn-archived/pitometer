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

/**
 *
 */

/**
 * A pitometer source
 */
export interface ISource {
  /** Returns the result of a single indicator query */
  fetch(query: object): Promise<ISourceResult[] | boolean>;
  /**
   * Accepts an option object.
   * It is up to the implementation to store this data on the object as needed.
   */
  setOptions(options: IOptions): void;
}

/**
 * Represents the result of a query
 */
export interface ISourceResult {
  /**
   * The key is a unique identifier for a given entity that is inferred by the result
   */
  key: string;
  /**
   * The timestamp the returned value is from
   */
  timestamp: number;
  /**
   * A metrics value
   */
  value: number;
}

/**
 * A pitometer grader
 */
export interface IGrader {
  grade(
    id: string, results: ISourceResult[] | boolean, definition: any, compareResult? : IGradingResult): IGradingResult;
  setOptions(options: IOptions): void;
}

export interface IViolation {
  key?: string;
  value?: number;
  breach: string;
  metadata?: any;
}

export interface IIndividualGradingResult {
  key?: string;
  value: number;
  upperSevere?: number;
  upperWarning?: number;
  lowerWarning?: number;
  lowerSevere?: number;
}

export interface IGradingResult {
  id: string;
  score: number;
  violations: IViolation[];
  individualResults? : IIndividualGradingResult[]
}

export interface IObjectives {
  pass: number;
  warning: number;
}

export interface IIndicatorResult {
  id: string;
  value: number;
  score: number;
  violations: [];
}

export interface IRunResult {
  options: IOptions;
  timestamp: number;
  testContext : string;
  testRunId : string;
  totalScore: number;
  result: string;
  objectives: IObjectives;
  indicatorResults: IIndicatorResult[];
}

export interface IGradingDefinition {
  type: string;
  metricsScore: number;
}

export interface IIndicatorDefinition {
  id: string;
  source: string;
  query: any;
  grading: IGradingDefinition;
  metadata: any;
}

export interface IPerfspec {
  spec_version: string;
  indicators: IIndicatorDefinition[];
  objectives: IObjectives;
}

export interface IDatastore {
  writeToDatabase(result: IRunResult, callback);
  pullFromDatabase(callback);
}

export interface IOptions {
  context: string;
  compareContext? : object;
  timeStart: number;
  timeEnd: number;
  individualResults?: boolean;
}
