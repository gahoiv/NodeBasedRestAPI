'use strict';
var config = require("../config");

var MongoClient = require('mongodb').MongoClient;
var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;

function getTopTestcases(request, response, top) {
    if(top == null)
    {
        top = 5;
    }
    MongoClient.connect(mongoURL,function(err, client) {
        var db = client.db(config.mongoDBName);
        var collection = db.collection(config.mongoCollectionName);

        collection.group(['count', 'testCaseId'], {'testStatus':"Pass"}, {"count":1}, "function (obj, prev) { prev.count++; }", function(err, results) {
            
            results.sort(compareDESC);

            var accu = [];
            populatePassData(collection, results, 0, top, accu, response, client);
            
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

function populatePassData(collection, results, index, max, accu, response,client)
{
    accu[index] = {};
    accu[index]["TestCaseId"] = results[index]["testCaseId"];
    accu[index]["PassedExecution"] = results[index]["count"];
    collection.findOne({"testCaseId": results[index]["testCaseId"]},{fields:{"testName":1}}, function(err, document){
        
        accu[index]["TestCasesName"] = document["testName"];
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
    collection.count({"testCaseId": results[index]["testCaseId"], 'testStatus':"Ignore"}, function(err, count){
        accu[index]["SkippedExecution"] = count;
        if(index < max-1)
        {
            populatePassData(collection,results, index+1, max, accu, response, client);
        }else {
            response.writeHead(200,{"content-type":"application/json"});
            response.write(JSON.stringify(accu));
            client.close();
            response.end();
        }
    });
}
exports.getTopTestcases = getTopTestcases;