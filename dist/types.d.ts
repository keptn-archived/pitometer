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
export interface ISource {
    fetch(query: object): Promise<ISourceResult[] | boolean | boolean | null>;
    setOptions(options: IOptions): void;
}
export interface ISourceResult {
    key: string;
    timestamp: number;
    value: number;
}
export interface IViolation {
    key: string;
    value: number;
    breach: string;
}
export interface IGrader {
    grade(id: string, results: ISourceResult[] | boolean, definition: any, context?: any): IGradingResult;
    setOptions(options: IOptions): void;
}
export interface IGradingResult {
    id: string;
    score: number;
    violations: any;
}
export interface IObjectives {
    pass: number;
    warning: number;
}
export interface IINdicatorResult {
    id: string;
    value: number;
    score: number;
    violations: [];
}
export interface IRunResult {
    totalScore: number;
    result: string;
    objectives: IObjectives;
    indicatorResults: IINdicatorResult[];
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
export interface IMonspec {
    spec_version: string;
    indicators: IIndicatorDefinition[];
    objectives: IObjectives;
}
export interface IOptions {
    context: string;
    timeStart: number;
    timeEnd: number;
}
