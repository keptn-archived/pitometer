export interface Query {
    timeseriesId: string;
    aggregation: string;
    entityIds: string[];
    tags: string[];
    smartscape: string;
}
export interface Metric {
    id: string;
    query: Query;
}
export interface Source {
    id: string;
    metrics: Metric[];
}
export interface Thresholds {
    upperSevere: number;
    upperWarning: number;
    lowerWarning?: number;
    lowerSevere?: number;
}
export interface Signature {
    metricsId: string;
    thresholds: Thresholds;
    acceptedDeviation: string;
    metricScore: number;
    playbookhints: string[];
}
export interface ScoreThresholds {
    pass: number;
    warning: number;
}
export interface RootObject {
    spec_version: string;
    sources: Source[];
    signature: Signature[];
    scoreThresholds: ScoreThresholds;
}
