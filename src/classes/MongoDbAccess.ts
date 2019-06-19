import { IRunResult, IDatastore } from '../types';
import { Pitometer } from './Pitometer';

const PitometerDBName = "PitometerDB";

export class MongoDbAccess implements IDatastore {

    private pitometer: Pitometer;
    private mongoUrl: string;
    private queryLimit: number;

    constructor(pitometer: Pitometer, mongoUrl: string, queryLimit = 5) {
        this.pitometer = pitometer;
        this.mongoUrl = mongoUrl;
        this.queryLimit = queryLimit;
    }

    public removeAllFromDatabase(context, callback) {
        if (this.mongoUrl === undefined)
            callback(true);

        var MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(this.mongoUrl, function (err, db) {
            if (err) {
                callback(err, false);
                return;
            }

            var dbo = db.db(PitometerDBName);
            dbo.collection(context).drop(function (err, res) {
                if (err) {
                    console.log(err); callback(err, false);
                } else {
                    console.log("Deleted " + context);
                    callback(null, true);
                }
                db.close();
            });
        });
    }

    /**
     * If there is a MongoDB Connection specified -> writes this to the MongoDB
     * @param result 
     */
    public writeToDatabase(result: IRunResult, callback) {
        if (this.mongoUrl === undefined)
            callback(true);

        const pitometer = this.pitometer;
        var MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(this.mongoUrl, function (err, db) {
            if (err) {
                callback(err, false);
                return;
            }

            var dbo = db.db(PitometerDBName);
            dbo.collection(pitometer.getTestContext()).insertOne(result, function (err, res) {
                if (err) {
                    console.log(err); callback(err, false);
                } else {
                    console.log("1 pitometer result inserted into " + pitometer.getTestContext() + ": " + res.insertedId);
                    callback(null, res.insertedId);
                }
                db.close();
            });
        });
    }

    /**
     * Pulls results from the database and passes them to the callback
     */
    public async pullFromDatabase(callback) {
        if (this.mongoUrl === undefined) {
            callback("no mongo specified", null);
            return;
        }

        const pitometer = this.pitometer;
        const pulledResults: IRunResult[] = [];
        const queryLimit = this.queryLimit;

        var MongoClient = require('mongodb').MongoClient;

        // connect to Mongo
        MongoClient.connect(this.mongoUrl, function (err, db) {
            if (err) {
                callback(err, null);
                return;
            }

            // connect to the database
            var dbo = db.db(PitometerDBName);

            // compareContext can either be undefined (returns last X), a string (identifiying a speciifc testRunId) or an object with a .find, .sort and .limit field
            var compareContext:any = pitometer.getOptions().compareContext;

            // 1: Query for a specific testRunId
            if(typeof(compareContext) === "string") {
                // or pull the one testRunId that the user wants us to compare as defined in compareContext
                console.log("Query for : " + pitometer.getTestContext() + "-" + compareContext);
                dbo.collection(pitometer.getTestContext()).findOne({ "testRunId": compareContext }, function (err, result) {
                    db.close();
                    if (err) {
                        callback(err, null);
                    } else {
                        pulledResults.push(result);
                        callback(null, pulledResults);
                    }
                });
            }  
            // 2: execute a specific query as passed on compareContext
            else if (typeof(compareContext) === 'object') {
                /**
                 * Example CompareContext
                 * { 
                 *   find : {result : "pass"},
                 *   sort : {timestamp : -1 },
                 *   limit : 5
                 * }
                 */
                console.log("Query for: " + JSON.stringify(compareContext));
                dbo.collection(pitometer.getTestContext()).find(compareContext.find).sort(compareContext.sort).limit(compareContext.limit).toArray(function(err, result) {
                    db.close();
                    if (err) {
                        callback(err, null);
                    } else {
                        pulledResults.push(...result);
                        callback(null, pulledResults);
                    }
                });
            } 
            // 3: just return last X
            else {
                var actualLimit = queryLimit;
                if(typeof(compareContext) === 'number')
                    actualLimit = compareContext;

                console.log("Query for last " + actualLimit + " Results");
                dbo.collection(pitometer.getTestContext()).find({}).limit(actualLimit).toArray(function (err, result) {
                    db.close();
                    if (err) {
                        callback(err, null);
                    } else { 
                        pulledResults.push(...result);
                        callback(null, pulledResults);
                    }
                });
            } 
        });
    }
}
