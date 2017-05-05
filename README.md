marchio-lambda-put
==
REST POST to DynamoDB via Lambda
--

<p align="left">
  <a href="https://travis-ci.org/mitchallen/marchio-lambda-put">
    <img src="https://img.shields.io/travis/mitchallen/marchio-lambda-put.svg?style=flat-square" alt="Continuous Integration">
  </a>
  <a href="https://codecov.io/gh/mitchallen/marchio-lambda-put">
    <img src="https://codecov.io/gh/mitchallen/marchio-lambda-put/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://npmjs.org/package/marchio-lambda-put">
    <img src="http://img.shields.io/npm/dt/marchio-lambda-put.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://npmjs.org/package/marchio-lambda-put">
    <img src="http://img.shields.io/npm/v/marchio-lambda-put.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://npmjs.com/package/marchio-lambda-put">
    <img src="https://img.shields.io/github/license/mitchallen/marchio-lambda-put.svg" alt="License"></a>
  </a>
</p>

## Installation

    $ npm init
    $ npm install marchio-lambda-put --save
  
* * *

* * *

## Lambda Setup

### References

* __[marchio-lambda-post](https://www.npmjs.com/package/marchio-lambda-post)__
* __[marchio-lambda-get](https://www.npmjs.com/package/marchio-lambda-get)__
* __[Create an API with Lambda Proxy Integration through a Proxy Resource](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)__
* [A Lambda Function in Node.js for Proxy Integration](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html#api-gateway-proxy-integration-lambda-function-nodejs)
* [Build an API Gateway API Using Proxy Integration and a Proxy Resource](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy.html)
* [Create and Test an API with HTTP Proxy Integration through a Proxy Resource](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-http.html)

* * *

### Steps

#### Create Test Role

* Browse to: https://console.aws.amazon.com/iam/
* Click: __Roles__ (from the left column)
* Click: __Create new role__
* __Step 1: Select role type__
 * Expand Section: __AWS Service Role__
 * For __AWS Lambda__, click: __Select__
* __Step 2__ is automatically skipped
* __Step 3: Attach policy__
 * Select both __AmazonDynamoDB*__ policies
* Click: __Next Step__
* Create a name for the role (like __lambda-db-put__)
* Click: __Create role__

#### Create Lambda Function

* Browse to: https://console.aws.amazon.com/lambda
* Click: __Create a Lambda Function__
* Select: __Blank Function__
* Click: __Next__
* Name: __marchio-put__
* Description: __Marchio service__
* Runtime: __Node.js 4.3__
* Set the Role
 * Role: __Choose and existing role__
 * Existing role: __service-role/__(name of role you created earlier)
* Click: __Next__
* Click: __Create Function__

#### Setup API Gateway

* Browse to: https://console.aws.amazon.com/apigateway
* Click: __Create API__
* Select: __New API__
* API name: __marchio-put__
* Description: __Marchio service__
* Click: __Create API__
* Click on the slash (__/__)
* Drop down: __Actions__
* Select: __Create Resource__
* Check: __Configure as proxy resource__
* (Optionally enabled __CORS__)
* Click: __Create Resource__
* For __Integration type__ select: __Lambda Function Proxy__
* Lambda Region: For example: __us-east-1__
* Lambda Function: __marchio-put__
* Click: __Save__
* Add Permission to Lambda Function: __OK__
* Drop down: __Actions__
* Select: __Deploy API__
* Define a new stage (call it "test")
* Click: __Deploy__
* Save the __Invoke URL__

#### Create DynamoDB Table

* Browse to: https://console.aws.amazon.com/dynamodb/
* Click: __Create Table__
* Table name: __mldb__
* Primary key: __eid__
* The type should be the default (string)
* Click: __Create__
* After some churning, click the __Capacity__ tab
* Set the __Read / Write capacity units__ to __1__ to save money while testing
* Click: __Save__

#### Example and Deploy

See the deployment example located in the repo under:

* examples/deploy

It contains a deployment script and an example lambda source file.

* Install the dependencies by running:
```
$ npm install
```

To run the script you must first make it runnable:
```
$ chmod +x deploy-lambda.sh
```

To test:

* Deploy the API via API Gateway
* Create an environment variable called __AWS\_HOST\_MARCHIO\_PUT__ which is set to the invocation url
* Test the deployment using __curl__:
```
$ curl -i -X PUT -H "Content-Type: application/json" -d '{"email":"test@beta.com"}' $AWS_HOST_MARCHIO_PUT/test/marchio-put/mldb/110ec58a-a0f2-4ac4-8393-c866d813b8d1
```
* The response should contain a 204 status code.
* Browse the DynamoDB table to see the updated record.

* * *

## Testing

To test, go to the root folder and type (sans __$__):

    $ npm test
   
* * *
 
## Repo(s)

* [bitbucket.org/mitchallen/marchio-lambda-put.git](https://bitbucket.org/mitchallen/marchio-lambda-put.git)
* [github.com/mitchallen/marchio-lambda-put.git](https://github.com/mitchallen/marchio-lambda-put.git)

* * *

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.1.0 

* initial release

* * *
