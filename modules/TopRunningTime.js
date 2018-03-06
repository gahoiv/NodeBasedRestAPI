'use strict';
var config = require("../config");

var MongoClient = require('mongodb').MongoClient;
var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;
var parallelCount = 0;

function getTopTestsRunningTime(request, response, top, executionTimeSortOrder)
{
    this.asc = (executionTimeSortOrder &&  executionTimeSortOrder.toUpperCase() == "MAX"? false : true);
    this.top = top?top:5;
    this.parallelCount = 0;
    this.maximumTestCaseCount = 0;
    this.request = request;
    this.response = response;
    this.mongoClient = null;
    this.resultArray = [];
    var self = this;
    MongoClient.connect(mongoURL,function(err, client) {
        self.mongoClient = client;
        var db = client.db(config.mongoDBName);
        var collection = db.collection(config.mongoCollectionName);
        collection.distinct("testCaseId", function(err, docs){
            if(!docs || docs.length <= 0)
            {
                response.writeHead(204,{"content-type":"text/xml"});
                response.write("No-Content");
                client.close();
                response.end();
                return;
            }
            self.parallelCount = 0;
            self.maximumTestCaseCount = docs.length;
            for(var i=0; i< docs.length; i++)
            {
                self.retriveRunningTimeForTestCase(docs[i], collection);
            }
            
        });
    });

    
    this.compareASC = function(a,b){
        return compare(a,b, true);
    };
    this.compareDESC = function(a,b){
        return compare(a,b, false);
    };

    this.responseHandler = function() {
        this.parallelCount++;
        if(this.parallelCount >= this.maximumTestCaseCount)
        {
            
            if(this.mongoClient != null)
            {
                this.mongoClient.close();
            }
            this.resultArray.sort(this.asc? this.compareASC:this.compareDESC);
            var topResultArray = this.resultArray.slice(0, this.top < this.resultArray.length?this.top:this.resultArray.length);
            this.response.writeHead(200,{"content-type":"application/json"});
            this.response.write(JSON.stringify(topResultArray));
            
            response.end();
        }
    };


    this.retriveRunningTimeForTestCase = function(testCaseId, collection)
    {
        var self = this;
        collection.find( {"testCaseId": testCaseId},
                    {fields:{"testName":1, "testCaseStartTime":1, "testCaseEndTime":1}})
                    .toArray(
                        function(err, docs){
                            if(err != null)
                            {
                                return;
                            }
                            var totalRunningTime = 0;
                            for(var i = 0; i< docs.length; i++)
                            {
                                totalRunningTime += (docs[i].testCaseEndTime - docs[i].testCaseStartTime);
                            }
                            var averageRunningTime = totalRunningTime / docs.length;
                            self.resultArray.push({"Test case Id":testCaseId, "Test case name":docs[0].testName, "AverageRunTime":Math.floor(averageRunningTime)});
                           
                            self.responseHandler();
                        } );
    }
}

function compare (a,b, asc)
    {
        var res = 0;
        if( a.AverageRunTime < b.AverageRunTime)
        {
            res = -1;
        }else if( a.AverageRunTime > b.AverageRunTime)
        {
            res =  1;
        }

        return res*(asc? 1:-1);
};

exports.topTestsRunningTime = getTopTestsRunningTime;