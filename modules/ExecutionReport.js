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
        
        var totalTestCaseFind = function(){
            collection.count(function(err, count){
                if(err == null)
                {
                    resultObj["Total Test Cases"]= count;
                }else {
                    resultObj["Total Test Cases"]= 0;
                }
                totalPassFind();
            });
        };

        var totalPassFind = function (){
            collection.count({"testStatus":"Pass"}, function(err, count){
                if(err == null)
                {
                    resultObj["Total Passed"]= count;
                }else {
                    resultObj["Total Passed"]= 0;
                }
                totalFailFind();
            });

            
        };

        
        
        var totalFailFind = function(){
            collection.count({"testStatus":"Fail"}, function(err, count){
                if(err == null)
                {
                    resultObj["Total Failed"]= count;
                }else {
                    resultObj["Total Failed"]= 0;
                }
                totalSkippedFind();
            });
            
        };
        
        var totalSkippedFind = function() {
            collection.count({"testStatus":"Ignore"}, function(err, count){
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

        totalTestCaseFind();
      

        });
    }
//executionReport();
    exports.getExecutionReport = executionReport;