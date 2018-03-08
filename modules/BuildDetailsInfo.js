'use strict';
var config = require("../config");

var MongoClient = require('mongodb').MongoClient;
var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;

function BuildDetailsInfo(request, response, limit) {
    this.request = request;
    this.response = response;
    this.limit = limit? limit : 5;
    this.resultArray = [];
    this.dataCount = 0;
    this.maxDataCount = 0;

    this.getLatestBuildsInfo = function()
    {
        var self = this;

        MongoClient.connect(mongoURL,function(err, client) {
            //self.mongoClient = client;
            var db = client.db(config.mongoDBName);
            var collection = db.collection(config.mongoCollectionName);
            
            var options = { "sort": [['sessionEndTime',-1]] };
            collection.distinct('sessionEndTime',  function(err, doc) {
                doc.sort();
                var docLength = doc.length;
                
                var startIndex = Math.max(0, docLength - self.limit);
                if(self.limit > docLength)
                {
                    self.maxDataCount = docLength;
                }else {
                    self.maxDataCount = self.limit;
                }
                for(var i = docLength -1; i >=startIndex; i--)
                {
                    self.populateBuildTime(doc[i], {}, collection);
                }
            });

        });
    };

    this.populateBuildTime = function(sessionEndTime, obj, collection){
        var self = this;
        collection.findOne({"sessionEndTime": sessionEndTime}, function(err, document){
            if(err != null)
            {
                return;
            }
            obj["SessionStartTime"] = document.sessionStartTime;
            obj["SessionEndTime"] = document.sessionEndTime;
            obj["SessionId"] = document.sessionId;
            self.populateTestCaseData(sessionEndTime, obj, collection);
        });
    };

    this.populateTestCaseData = function(sessionEndTime, obj, collection) {
        var self = this;
        collection.find({"sessionEndTime": sessionEndTime}, function(err, docs){
            if(err != null)
            {
                return;
            }
            
            docs.toArray(function(err, documents){
                var totalPassCount = 0;
                var totalFailCount = 0;
                var totalSkipCount = 0;
                for(var i =0; i < documents.length; i++) {
                    if(documents[i].testStatus == 'Pass')
                    {
                        totalPassCount++;
                    }
                    if(documents[i].testStatus == 'Fail')
                    {
                        totalFailCount++;
                    }
                    if(documents[i].testStatus == 'Skip')
                    {
                        totalSkipCount++;
                    }
                }

                obj["Total_Pass"] = totalPassCount;
                obj["Total_Fail"] = totalFailCount;
                obj["Total_Skip"] = totalSkipCount;
                

                self.updateCallBack(obj);

            });
        });
    };

    this.updateCallBack = function(obj)
    {
        this.dataCount++;
        this.resultArray.push(obj);
        if(this.dataCount >= this.maxDataCount)
        {
            this.resultArray.sort(this.compareDESC);
            if(this.mongoClient != null)
            {
                this.mongoClient.close();
            }
            this.response.writeHead(200,{"content-type":"application/json"});
            this.response.write(JSON.stringify(this.resultArray));
            
            response.end();
        }
    };

    this.compareDESC = function(a,b)
    {
        var res = 0;
        //console.log(a["SessionEndTime"] +"   "+ b.sessionEndTime);
        if( a.SessionEndTime < b.SessionEndTime)
        {
            res = -1;
        }else if( a.SessionEndTime > b.SessionEndTime)
        {
            res =  1;
        }
        return res * -1;
    }

    
}
//new BuildDetailsInfo().getLatestBuildsInfo();
exports.BuildDetailsInfo = BuildDetailsInfo;