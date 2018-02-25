'use strict';
var config = require("../config");

var MongoClient = require('mongodb').MongoClient;
var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;
function executionReport(request, response)
{
    var resultObj = {};    
    MongoClient.connect(mongoURL,function(err, client) {
        if(err != null)
        {
                return;
        }
            
        var db = client.db(config.mongoDBName);
        var collection = db.collection(config.mongoCollectionName);

        collection.find().sort({sessionEndTime: -1}).limit(1);
        var options = { "sort": [['sessionEndTime',-1]] };
        collection.findOne({}, options , function(err, doc) {
            var lastSessionEndTime = doc.sessionEndTime;
            totalTestCaseFind(lastSessionEndTime);
        }); 
        
        var totalTestCaseFind = function(lastSessionEndTime){
            collection.count({"sessionEndTime":lastSessionEndTime},function(err, count){
                if(err == null)
                {
                    resultObj["Total Test Cases"]= count;
                }else {
                    resultObj["Total Test Cases"]= 0;
                }
                totalPassFind(lastSessionEndTime);
            });
        };

        var totalPassFind = function (lastSessionEndTime){
            collection.count({"sessionEndTime":lastSessionEndTime, "testStatus":"Pass"}, function(err, count){
                if(err == null)
                {
                    resultObj["Total Passed"]= count;
                }else {
                    resultObj["Total Passed"]= 0;
                }
                totalFailFind(lastSessionEndTime);
            });

            
        };

        
        
        var totalFailFind = function(lastSessionEndTime){
            collection.count({"sessionEndTime":lastSessionEndTime,"testStatus":"Fail"}, function(err, count){
                if(err == null)
                {
                    resultObj["Total Failed"]= count;
                }else {
                    resultObj["Total Failed"]= 0;
                }
                totalSkippedFind(lastSessionEndTime);
            });
            
        };
        
        var totalSkippedFind = function(lastSessionEndTime) {
            collection.count({"sessionEndTime":lastSessionEndTime,"testStatus":"Skip"}, function(err, count){
                if(err == null)
                {
                    resultObj["Total Skipped"]= count;
                }else {
                    resultObj["Total Skipped"]= 0;
                }
                totalSuiteFound();
            });
            
        };
        
        var totalSuiteFound = function() {
            collection.distinct("featureName", function(err, docs){
                if(docs != null)
                {
                    resultObj["Total Features"]= docs.length;
                }
                response.writeHead(200,{"content-type":"application/json"});
                response.write(JSON.stringify(resultObj));
                client.close();
                response.end();
            });

            
        };

        
      

        });
    }
//executionReport();
    exports.getExecutionReport = executionReport;