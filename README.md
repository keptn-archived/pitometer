# Pitometer

Pitometer is a Node.js module that helps you to qualify the overal performance
or quality of applications using a well defined specificaton format.

The specification is done using the Perfspec format which is a declarative way to
define which metrics you want to pay attention to, the sources to collect
them from and how to grade/interpret the results.

Pitometer is pluggable and accepts different sources and grading mechanisms.
Right now, source plugins for Dynatrace and Prometheus and a grader for thresholds
are available but it's easy to write new sources and graders.

## Quickstart

1. As long as this module is not available on npm, please
   run `npm install -S https://github.com/pitometer/pitometer` to install it
   into your Node.js project. Sources can be installed the same way.

2. Require, configure and register all components and
   run the Perfspec file.

  ```js
  const Pitometer = require('@pitometer/pitometer').Pitometer;
  const DynatraceSource = require('@pitometer/source-dynatrace').Source;
  const PrometheusSource = require('@pitometer/source-prometheus').Source;
  const ThresholdGrader = require('@pitometer/grader-threshold').Grader;

  const pitometer = new Pitometer();

  // Register a Prometheus source that will be used if the source ID in your
  // Perfspec matches 'Prometheus'
  pitometer.addSource('Prometheus', new PrometheusSource({
    queryUrl: '<PROMETHEUS_PROMQL_ENDPOINT>',
  }));

  // Register a source that will be used if the source ID in your Perfspec matches
  // 'Dynatrace'
  pitometer.addSource('Dynatrace', new DynatraceSource({
    baseUrl: '<DYNATRACE_ENVIRONMENT_URL>',
    apiToken: '<DYNATRACE_API_TOKEN>',
    // Optional: A logger to be used for debugging API requests
    // log: console.log,
  }));

  // Register a grader for thresholds that will be used if the grader type
  // matches 'Threshold'
  pitometer.addGrader('Threshold', new ThresholdGrader());

  // Load a Perfspec - see the samples directory
  const perfspec = require('./samples/perfspec-sample.json');

  // Run the Perfspec, passing in an optional context parameter 'prod'
  // and log the result out to the console
  pitometer.run(perfspec, {
    context: 'Optional context that is passed to all sources and graders',
    timeStart: START_TIME_IN_SECONDS,
    timeEnd: END_TIME_IN_SECONDS,
  })
    .then((results) => console.log(JSON.stringify(results)))
    .catch((err) => console.error(err));
  ```

## API Documentation

The API documentation can be found [here](./docs).