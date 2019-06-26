import { IRunResult } from '../types';

/**
 * Here some documentation on the runResults data structure
 * 
 * IRunResult
 * _id: 5d088eb115575705eb2a89eb,
    options:
     { context: 'keptn-project-1/keptn-service-1/stageabc/c69a21e3-7967-465e-a894-fdf0d443ba79',
       mongoDb: 'mongodb://localhost:27017/',
       individualResults: true,
       timeStart: 1560669103.788,
       timeEnd: 1560841903.788 },
    timestamp: 1560841904845,
    testContext: 'keptn-project-1/keptn-service-1/stageabc',
    testRunId: 'c69a21e3-7967-465e-a894-fdf0d443ba79',
    totalScore: 0,
    objectives: { pass: 90, needsreview: 75 },
    indicatorResults: [ [Object] ],
    result: 'fail' }
 * 
 * IndicatorResults:
 * { id: 'ResponseTime_Service',
    violations: [ [Object] ],
    score: 0,
    individualResults:
     [ [Object],
       [Object],
       [Object] ] } ]
 * 
 * IndividualResults:
*  { metadata: null,
    value: 17342676.8,
    key: 'SERVICE-221EF5E8D815D2D4',
    breach: 'upperSevere',
    threshold: 1000000 } ]
 */

const COLOR_BLUE = "#0000FF"
const COLOR_RED = "#FF0000"
const COLOR_YELLOW = "#FFFF00"

export class Reporter  {

    constructor() {
    }

    static replaceAll(originalString, find, replace) {
        return originalString.replace(new RegExp(find, 'g'), replace);
    };

    /**
     * Iterates over the runResults and returns a JSON String that can be used in an HTML document to be visualized with HighCharts
     * @param runResults 
     */
    public generateTimeseriesForReport(runResults : IRunResult[]) : object {       
        // This Map works like this
        /**
         * "Score" :
         *  "value"  : data = [{name:"test1", y:100, color:green},{name:"test2", y:50, color:red},...]
         *  "pass"   : data = {{name:"test1", y:90}
         *  "warning": data = [{name:"test1", y:75}
         * 
         * "ResponseTime_ServiceABC" :
         *   "value" : {name:"test1", y:1}
         *   "upperSevere" : {name:"test1", y:2}
         * 
         * "FailureRate:"
         *   "value" : 
         * 
         */
        var reportSeriesMap = new Map<String, Map<String, object>>();

        // this is our actual return value
        var returnTimerseries = {xAxis : [], reportSeriesMap : null}

        // color maps for pass, fail ...
        var colorMap = new Map([["pass", "#00FF00"], ["warning", "#FFFF00"], ["fail", "#FF0000"]]);

        // this is our special metric: total score 
        var totalScoreSeries = {"name" : "Score", "data" : []}
        var reportSeriesScore = new Map<String,Object>();
        reportSeriesScore.set("value", totalScoreSeries)
        reportSeriesMap.set("Score", reportSeriesScore)
        

        // 1: Get the different build id's and the total score of each run
        for(var resultIx=0;resultIx<runResults.length;resultIx++) {
            var runResult = runResults[resultIx];
            returnTimerseries.xAxis.push(runResult.testRunId);
            totalScoreSeries.data.push({name:runResult.testRunId/*runResult.timestamp*/, y:runResult.totalScore,color:colorMap.get(runResult.result)});

            for(var indResIx=0;indResIx<runResult.indicatorResults.length;indResIx++) {
                var indResult:any = runResult.indicatorResults[indResIx];

                // if we have individual results we include all of them - otherwise we just chart the score
                if(indResult.individualResults) {
                    // Individual Results have an objectkey for e.g: SERVICE1, SERVICE2, ... - therefore our metricid will be e.g: ResponseTime_Service_SERVICE1234
                    for(var indivResIx=0;indivResIx<indResult.individualResults.length;indivResIx++) {
                        var individualResult:any = indResult.individualResults[indivResIx];
                        var seriesId = indResult.id + "_" + individualResult.key;

                        // lets get the map entry for e.g: RespoinseTime_SERVICE1234 - or create it if it doesnt exists
                        var reportSeries:any = reportSeriesMap.get(seriesId);
                        if(!reportSeries) { 
                            reportSeries = new Map<String, Object>() ;
                            reportSeriesMap.set(seriesId, reportSeries);
                        }

                        // now we make sure we have the actual value entry where we put all our actual data
                        var reportSeriesValue = reportSeries.get("value");
                        if(!reportSeriesValue) {
                            reportSeriesValue = {"color" : COLOR_BLUE, "name" : "value", "data" : []};
                            reportSeries.set("value", reportSeriesValue);
                        }

                        reportSeriesValue.data.push([runResult.testRunId/*runResult.timestamp*/, individualResult.value]);


                        // TODO - we also have the thresholds availble - could add these as extra data points!
                        if(individualResult.upperSevere) {
                            var reportSeriesUpperSevere = reportSeries.get("upperSevere");
                            if(!reportSeriesUpperSevere) {
                                reportSeriesUpperSevere = {"color": COLOR_RED, "name" : "upperSevere", "data" : []};
                                reportSeries.set("upperSevere", reportSeriesUpperSevere);
                            }
                            reportSeriesUpperSevere.data.push([runResult.testRunId/*runResult.timestamp*/, individualResult.upperSevere]);
                        }
                        if(individualResult.upperWarning) {
                            var reportSeriesUpperWarning = reportSeries.get("upperWarning");
                            if(!reportSeriesUpperWarning) {
                                reportSeriesUpperWarning = {"color": COLOR_YELLOW, "name" : "upperWarning", "data" : []};
                                reportSeries.set("upperWarning", reportSeriesUpperWarning);
                            }
                            reportSeriesUpperWarning.data.push([runResult.testRunId/*runResult.timestamp*/, individualResult.upperWarning]);
                        }
                        if(individualResult.lowerSevere) {
                            var reportSeriesLowerSevere = reportSeries.get("lowerSevere");
                            if(!reportSeriesLowerSevere) {
                                reportSeriesLowerSevere = {"color": COLOR_RED, "name" : "lowerSevere", "data" : []};
                                reportSeries.set("lowerSevere", reportSeriesLowerSevere);
                            }
                            reportSeriesLowerSevere.data.push([runResult.testRunId/*runResult.timestamp*/, individualResult.lowerSevere]);
                        }
                        if(individualResult.lowerWarning) {
                            var reportSeriesLowerWarning = reportSeries.get("lowerWarning");
                            if(!reportSeriesLowerWarning) {
                                reportSeriesLowerWarning = {"color": COLOR_YELLOW, "name" : "lowerWarning", "data" : []};
                                reportSeries.set("lowerWarning", reportSeriesLowerWarning);
                            }
                            reportSeriesLowerWarning.data.push([runResult.testRunId/*runResult.timestamp*/, individualResult.lowerWarning]);
                        }
                    }
                } else {
                    // We only have the global indicator result, e.g: ResponseTime_Service - thats the name we use to store that metric
                    var reportSeries:any = reportSeriesMap.get(indResult.id);
                    if(!reportSeries) reportSeries = {"name" : indResult.id, "data" : []};
                    reportSeries.data.push([runResult.testRunId/*runResult.timestamp*/, indResult.value]);
                    reportSeriesMap.set(indResult.id, reportSeries);
                }
            }
        }

        returnTimerseries.reportSeriesMap = reportSeriesMap;
        return returnTimerseries;
    }

    /**
     * 
     * @param mainReport 
     * @param seriesTemplate 
     * @param seriesPlaceholder 
     * @param timeseriesData 
     */
    public generateHtmlReport(mainReport:string, seriesTemplate:string, seriesPlaceholder:string, timeseriesData) : string {
        var resultFile:string = mainReport;

        var xAxisDefinition = JSON.stringify(timeseriesData.xAxis);

        // now lets get all our indicatorids - which also includes score
        var timeseriesKeys = Array.from(timeseriesData.reportSeriesMap.keys());

        for(var tsIx=0;tsIx<timeseriesKeys.length;tsIx++) {
            var timeseriesName = timeseriesKeys[tsIx];
            var timeseriesMapEntry = timeseriesData.reportSeriesMap.get(timeseriesName);

            // var timeseries:any = [timeseriesData.timeseries[tsIx]];

            // lets do all our replacements
            var seriesString = Reporter.replaceAll(seriesTemplate, "uniqueChartnamePlaceholder", timeseriesName)
            seriesString = seriesString.replace("X_AXIS_CATEGORIES", xAxisDefinition);
            seriesString = seriesString.replace("CHART_TYPE", timeseriesName == "Score" ? "column" : "line");

            // lets replace the actual timeseries
            var timeseries = Array.from(timeseriesMapEntry.values())
            var timeseriesAsText = JSON.stringify(timeseries)
            resultFile = resultFile.replace(seriesPlaceholder, seriesString.replace("seriesPlaceholder", timeseriesAsText));
        }

        return resultFile;
    }
}