var config = require("./config");
var executionReport = require("./modules/ExecutionReport");
var topFeatures = require("./modules/TopFeatures");
var topTestcases = require("./modules/TopTestCases");

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
    
    executionReport.getExecutionReport(req, res);
});

app.get('/topFeatures', function (req, res) {
    
    var number = req.query.number;
    var executionResult = req.query.executionResult;
    
    topFeatures.getTopFeaturs(req, res, number, executionResult);
});

app.get('/topTestCases', function (req, res) {
    
    var number = req.query.number;
    var executionResult = req.query.executionResult;
    
    topTestcases.getTopTestcases(req, res, number, executionResult);
});


var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port
 
    console.log("Example app listening at http://%s:%s", host, port)
 })
