export interface ISource {
  fetch(query: object): Promise<number | boolean>;
}
export interface IGrader {
  grade(id: string, value: number | boolean, definition: any, context?:any): IGradingResult;
}
export interface IGradingResult {
  id: string;
  value: number | boolean;
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
