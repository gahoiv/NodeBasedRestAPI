# NodeBasedRestAPI

## Prerequisite

* MongoDB need to be installed
* NodeJS need to be installed 

## Steps to follow

* Use git clone or download project from GIT
* Run the node_express_setup.sh using shell command to install express framework.
* Run following command from project root directory
    * Run following command: **node DummyDataInsert.js**
      This will insert 27000 dummy data in local mongo DB.
* Run node **node server.js**

## API exposed: 
* http://localhost:8080/ExecutionInfo.json : Gives the last execution result
* http://localhost:8080/topFeatures?number=6&executionResult=Skip
* http://localhost:8080/topTestCases?number=6&executionResult=Skip(
**Note:** executionResult acceptable values: Pass, Fail, Skip. Default is Pass. Cross-Origin supported
