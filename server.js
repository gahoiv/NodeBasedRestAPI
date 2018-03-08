var config = require("./config");
var executionReport = require("./modules/ExecutionReport");
var topFeatures = require("./modules/TopFeatures");
var topTestcases = require("./modules/TopTestCases");
var topRunningTimeTestCases = require("./modules/TopRunningTime");
var buildDetailInfo = require("./modules/BuildDetailsInfo");

var express = require('express');
var app = express();
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });


app.get('/', function (req, res) {
    
    res.send('Welcome to CodeOreo');
});

app.get('/ExecutionInfo*', function (req, res) {
    try{
        executionReport.getExecutionReport(req, res);
    } catch(e){
        handleServerError(req, res);
    }
});


app.get('/topFeatures', function (req, res) {
    
    var number = req.query.number;
    var executionResult = req.query.executionResult;
    try{
        topFeatures.getTopFeaturs(req, res, number, executionResult);
    } catch(e){
    handleServerError(req, res);
}
});

/*
* Returns the top test cases.
* Top test cases will be decided based on the user specified values of following argument.
* number : Integer - Number of test cases that user expects to see. Default is 5.

* executionTime: String [accepted values : < min | max > ] - If user specifies this argument with
* request parameter, this API will return test cases based on their running time. If executionTime
* value is "min" then top minimum time taking test cases will be returned and if value is "max" then
* maximum time taking tast cases will be returned.
* If user provides this argument but value is illegal or unacceptable, then it will send top minimum 
* time taking test cases.
*
* lastSession: Accepted values <true | false> This attribute works along with executionTime. If this is true then
* then top test cases will be choosen from last executed session.
*
*
* executionResult : String [Accepted values < Pass | Fail | Skip> . Default: Pass] - Return the top
* test cases which has maximum number of result specified by user. For an example, if user specifies "Fail"
* as value of this parameter, then it will return top test cases which has maximum number of fail count.
*/
app.get('/topTestCases', function (req, res) {
    
    var number = req.query.number;
    var executionTimeSortOrder = req.query.executionTime;
    var lastSession = req.query.lastSession;
    
    var executionResult = req.query.executionResult;
    try{
        if(executionTimeSortOrder)
        {
            new topRunningTimeTestCases.topTestsRunningTime(req, res, number,executionTimeSortOrder, lastSession);
            
        }else {
            topTestcases.getTopTestcases(req, res, number, executionResult);
        }
    } catch(err){
        
        handleServerError(req, res);
    }
});

app.get('/latestBuildsInfo', function(req, resp){
    var number = req.query.number;
    new buildDetailInfo.BuildDetailsInfo(req, resp, number).getLatestBuildsInfo();
});

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
 });


function handleServerError(req, res)
{

    res.writeHead(500,{"content-type":"text/plain"});
    res.write("Internal Server Error");

    res.end();
}
