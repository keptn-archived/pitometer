import { ISource, IGrader, IRunResult, IMonspec } from '../types';
import { Indicator } from './Indicator';

export class Pitometer {

  private sources: ISource[] = [];
  private indicators: Indicator[] = [];
  private graders: IGrader[] = [];

  constructor() {

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
   * Executes a Monspec definition
   * @param spec The monspec as object
   * @param context An optional context object that is passed down through the chain
  */
  public async run(spec: IMonspec, context = ''): Promise<IRunResult> {

    spec.indicators.forEach((idcdef) => {
      const indicator = new Indicator(idcdef);
      indicator.setSource(this.sources[idcdef.source]);
      indicator.setGrader(this.graders[idcdef.grading.type]);
      this.indicators[idcdef.id] = indicator;
    });

    const promisedResults = Object.keys(this.indicators).map((key) => {
      const indicator = this.indicators[key];
      const indicatorResult = indicator.get(context);
      return indicatorResult;
    });

    const indicatorResults = await Promise.all(promisedResults);

    const totalScore = indicatorResults.reduce((total, result) => {
      return total + result.score;
    }, 0);

    const objectives = spec.objectives;

    if (objectives.pass <= totalScore) {
      return {
        totalScore,
        objectives,
        indicatorResults,
        result: 'pass',
      };
    }

    if (objectives.warning <= totalScore) {
      return {
        totalScore,
        objectives,
        indicatorResults,
        result: 'warning',
      };
    }

    return {
      totalScore,
      objectives,
      indicatorResults,
      result: 'fail',
    };
  }
}
