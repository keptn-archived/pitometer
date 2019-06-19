import { IRunResult, IDatastore } from '../types';
import { Pitometer } from './Pitometer';

const PitometerDBName = "PitometerDB";

export class MongoDbAccess implements IDatastore {

    private pitometer: Pitometer;
    private mongoUrl: string;

    constructor(pitometer: Pitometer, mongoUrl: string) {
        this.pitometer = pitometer;
        this.mongoUrl = mongoUrl;
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
        if (this.mongoUrl === undefined)
            return null;

        const pitometer = this.pitometer;
        const pulledResults: IRunResult[] = [];
        var MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(this.mongoUrl, function (err, db) {
            if (err) {
                callback(err, null);
                return;
            }

            var dbo = db.db(PitometerDBName);

            // Either query the last X successful builds
            if (pitometer.getOptions().compareContext === undefined) {
                console.log("1: " + pitometer.getTestContext());
                // dbo.collection(this.pitometer.getTestContext()).find({"result" : "pass"}).sort({"timestamp" : -1}).limit(5).toArray(function(err, result) {
                dbo.collection(pitometer.getTestContext()).find({}).toArray(function (err, result) {
                    db.close();
                    if (err) {
                        callback(err, null);
                    } else {
                        pulledResults.push(...result);
                        callback(null, pulledResults);
                    }
                });
            } else {
                // or pull the one testRunId that the user wants us to compare as defined in compareContext
                console.log("2: " + pitometer.getTestContext() + "-" + pitometer.getOptions().compareContext);
                dbo.collection(pitometer.getTestContext()).findOne({ "testRunId": pitometer.getOptions().compareContext }, function (err, result) {
                    db.close();
                    if (err) {
                        callback(err, null);
                    } else {
                        pulledResults.push(result);
                        callback(null, pulledResults);
                    }
                });
            }
        });
    }
}
