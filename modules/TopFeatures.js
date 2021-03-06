'use strict';
var config = require("../config");

var MongoClient = require('mongodb').MongoClient;
var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;

function getTopFeaturs(request, response, top, executionResult)
{
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
        collection.group(['count', 'featureName'], {'testStatus':executionResult}, {"count":1}, "function (obj, prev) { prev.count++; }", function(err, results) {
        
            if(!results || results.length <= 0)
            {
                response.writeHead(204,{"content-type":"text/xml"});
                response.write("No-Content");
                client.close();
                response.end();
                return;
            }
            results.sort(compareDESC);
            var topResultNumber = (top <= results.length? top : results.length);
            var accu =[];
            collectTotalTestcaseData(collection,results, 0, topResultNumber, accu, response, client);
            
            
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

function collectTotalTestcaseData(collection,results, index, max, accu, response, client)
{
    accu[index]={};
    accu[index]["Feature Name"] = results[index]["featureName"];
    collection.count({"featureName": results[index]["featureName"]}, function(err, count){
        accu[index]["Total Test Cases"] = count;
        collectPassTestcaseData(collection,results, index, max, accu, response, client);
    });
}

function collectPassTestcaseData(collection,results, index, max, accu, response, client)
{
    collection.count({"featureName": results[index]["featureName"], 'testStatus':"Pass"}, function(err, count){
        accu[index]["Total Passed"] = count;
        collectFailTestcaseData(collection,results, index, max, accu, response, client);
    });
}

function collectFailTestcaseData(collection,results, index, max, accu, response, client)
{
    collection.count({"featureName": results[index]["featureName"], 'testStatus':"Fail"}, function(err, count){
        accu[index]["Total Failed"] = count;
        collectIgnoreTestcaseData(collection,results, index, max, accu, response, client);
    });
}

function collectIgnoreTestcaseData(collection,results, index, max, accu, response, client)
{
    collection.count({"featureName": results[index]["featureName"], 'testStatus':"Skip"}, function(err, count){
        accu[index]["Total Skipped"] = count;
        if(index < max-1){
            collectTotalTestcaseData(collection,results, index+1, max, accu, response, client);
        }else{
            
            response.writeHead(200,{"content-type":"application/json"});
            response.write(JSON.stringify(accu));
            client.close();
            response.end();
        }
    });
}
//getTopFeaturs(null, null, 6);

exports.getTopFeaturs = getTopFeaturs;