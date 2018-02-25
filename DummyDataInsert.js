function test(){
    for(var i =0; i< 10; i++){
        var rnd = Math.floor( (Math.random()*3 ) + 1 );
        console.log(rnd);
    }

}
var initials = {

    sessionId : "jsjjzhhhxn",
    
    sessionName : "HAS_MAN_2018_02_20_12_23_56",
    
    sessionStartTime : "2018363738399",
    
    sessionEndTime : "2737489283889",
    
    sessionStatus : "Completed",
    
    userFirstName : "Hassan",
    
    userLastName : "Ahamed",
    
    userEmail : "hassan.ahamed@philips.com",
    
    userCode1Id : "310264220",
    
    userBU : "SIG",
    
    projecName : "Eleva",
    
    projectBuild : "1.0.0",
    
    environment : "VM1",
    
    subSessionId : "gdbzhkamk",
    
    subSessionStartTime : "367383748398",
    
    subSessionEndTime: "1236373883899",
    
    subSessionStatus : "Completed",

    featureName : "Feature",
    
    suiteName : "TestSuit",
    
    testCaseId : "TC",
    
    testName : "Add Patients",
    
    testStatus: "Pass"
    
    };

    var testcaseStatus = ["Pass", "Fail", "Skip"];


    function getDummyObject()
    {
        var obj = {};
        for(var attr in initials)
        {
            obj[attr] = initials[attr];
        }

        return obj;
    }

    function populateMongoDBCollection(collection, client, sessionIDIndex, sessionStartTimeIndex, buildStartTime)
    {
        
        var count = 1;
        var bulk = [];
        for(var featureID = 1; featureID <= 6; featureID++)
        {
            for(var suiteID = 1; suiteID <= 30; suiteID++)
            {
                for(var testcaseID = 1; testcaseID <= 30; testcaseID++)
                {
                    var obj = getDummyObject();
                    obj['sessionId'] = obj['sessionId']+sessionIDIndex;
                    obj['featureName'] = obj['featureName']+featureID;
                    obj['suiteName'] = obj['suiteName']+suiteID;
                    obj['testCaseId'] = obj['testCaseId']+testcaseID;
                    obj['testName'] = obj['featureName']+"-"+obj['suiteName'] +"-"+obj['testCaseId'];

                    var rndm = Math.floor( (Math.random()*3 ) + 1 );
                    obj['testStatus'] = testcaseStatus[rndm - 1];

                    var sessionStartTime = buildStartTime + (60*60*1000)*sessionStartTimeIndex;
                    var sessionEndTime = sessionStartTime + (10*60*1000);
                    obj['sessionStartTime'] = sessionStartTime;
                    obj['sessionEndTime'] = sessionEndTime;

                    bulk.push(obj);
                    
                }
            }
            
        }
        collection.insert(bulk,{w:1, keepGoing:true}, function(err, count){

                        if(sessionIDIndex > 5) {
                            client.close();
                        }else {
                            populateMongoDBCollection(collection, client, sessionIDIndex+1, sessionStartTimeIndex+2, buildStartTime);
                        }
        });
        
    }
    

    'use strict';
    var config = require("./config");

    var MongoClient = require('mongodb').MongoClient;
    var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;
    function insertIntoDB()
    {
        console.log("Please wait while inserting 32400 documents in MongoDB....");
        MongoClient.connect(mongoURL,function(err, client) {
            if(err != null)
            {
                return;
            }
            
            var db = client.db(config.mongoDBName);
            var collection = db.collection(config.mongoCollectionName);

            var yesterdayTime = (new Date().getTime()) - (24*60*60*1000);
            populateMongoDBCollection(collection, client, 1, 1, yesterdayTime);

            

        });
    }

    insertIntoDB();