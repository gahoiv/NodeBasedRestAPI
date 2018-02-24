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

    var testcaseStatus = ["Pass", "Fail", "Ignore"];


    function getDummyObject()
    {
        var obj = {};
        for(var attr in initials)
        {
            obj[attr] = initials[attr];
        }

        return obj;
    }

    function populateMongoDBCollection(collection)
    {
        console.log("Please wait while inserting 27000 documents in MongoDB....");
        var count = 1;
        for(var featureID = 1; featureID <= 30; featureID++)
        {
            for(var suiteID = 1; suiteID <= 30; suiteID++)
            {
                for(var testcaseID = 1; testcaseID <= 30; testcaseID++)
                {
                    var obj = getDummyObject();
                    obj['featureName'] = obj['featureName']+featureID;
                    obj['suiteName'] = obj['suiteName']+suiteID;
                    obj['testCaseId'] = obj['testCaseId']+testcaseID;
                    obj['testName'] = obj['featureName']+"-"+obj['suiteName'] +"-"+obj['testCaseId'];

                    var rndm = Math.floor( (Math.random()*3 ) + 1 );
                    obj['testStatus'] = testcaseStatus[rndm - 1];
                    collection.insert(obj, function(err, count){});
                }
            }
            
        }
        
    }
    'use strict';
    var config = require("./config");

    var MongoClient = require('mongodb').MongoClient;
    var mongoURL = config.mongoDBInitial+config.mongodbHOST+':'+config.mongodbPORT;
    function insertIntoDB()
    {
        
        MongoClient.connect(mongoURL,function(err, client) {
            if(err != null)
            {
                return;
            }
            
            var db = client.db(config.mongoDBName);
            var collection = db.collection(config.mongoCollectionName);


            populateMongoDBCollection(collection);

            client.close();

        });
    }

    insertIntoDB();