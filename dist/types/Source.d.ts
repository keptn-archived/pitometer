import { Metric } from './Metric';
export interface Source {
    addMetric(metric: Metric): any;
    fetch(): any;
}
