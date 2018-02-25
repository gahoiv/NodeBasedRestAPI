'use strict';
var config = require("../config");

var MongoClient = require('mongodb').MongoClient;
var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;

function getTopTestcases(request, response, top, executionResult) {
    if(top == null)
    {
        top = 5;
    }
    if(executionResult == null || (executionResult != "Pass" && executionResult != "Fail" && executionResult != "Skip"))
    {
        executionResult = "Pass";
    }
    MongoClient.connect(mongoURL,function(err, client) {
        var db = client.db(config.mongoDBName);
        var collection = db.collection(config.mongoCollectionName);

        collection.group(['count', 'testCaseId'], {'testStatus':executionResult}, {"count":1}, "function (obj, prev) { prev.count++; }", function(err, results) {
            
            results.sort(compareDESC);

            var accu = [];
            populateTestCaseName(collection, results, 0, top, accu, response, client);
            
        });
    });
}

function compareDESC(a,b)
{
    var res = 0;
    if( a.count < b.count)
    {
        res = -1;
    }else if( a.count > b.count)
    {
        res =  1;
    }
    return res * -1;
}

function populateTestCaseName(collection, results, index, max, accu, response,client)
{
    accu[index] = {};
    collection.findOne({"testCaseId": results[index]["testCaseId"]},{fields:{"testName":1}}, function(err, document){
        
        accu[index]["TestCasesName"] = document["testName"];
        populatePassData(collection,results, index, max, accu, response, client);
    });
}
function populatePassData(collection, results, index, max, accu, response,client)
{
    collection.count({"testCaseId": results[index]["testCaseId"], 'testStatus':"Pass"}, function(err, count){
        accu[index]["PassedExecution"] = count;
        populateFailData(collection,results, index, max, accu, response, client);
    });
    
}
function populateFailData(collection, results, index, max, accu, response, client)
{
    collection.count({"testCaseId": results[index]["testCaseId"], 'testStatus':"Fail"}, function(err, count){
        accu[index]["FailedExecution"] = count;
        populateIgnoreData(collection,results, index, max, accu, response, client);
    });
}
function populateIgnoreData(collection, results, index, max, accu, response, client)
{
    collection.count({"testCaseId": results[index]["testCaseId"], 'testStatus':"Skip"}, function(err, count){
        accu[index]["SkippedExecution"] = count;
        if(index < max-1)
        {
            populateTestCaseName(collection,results, index+1, max, accu, response, client);
        }else {
            response.writeHead(200,{"content-type":"application/json"});
            response.write(JSON.stringify(accu));
            client.close();
            response.end();
        }
    });
}
exports.getTopTestcases = getTopTestcases;