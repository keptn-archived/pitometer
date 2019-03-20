import { ISource, IGrader, IGradingDefinition, IIndicatorDefinition } from '../types';

export class Indicator {
  source: ISource;
  id: string;
  query: any;
  grading: IGradingDefinition;
  metadata: any;
  grader: IGrader;

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
  async get(context = '') {
    const value = await this.source.fetch(this.query);
    const grade = this.grader.grade(this.id, value, this.grading, context);
    return grade;
  }
}
