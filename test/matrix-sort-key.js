"use strict";

module.exports.create = (spec) => {

    spec = spec || {};

    return [
        { 
            key: "AWS",
            service: "aws lambda",
            table: "mldb-sort",  // DynamoDB table
            testPostHost: process.env.AWS_HOST_MARCHIO_SORT, 
            testPostPath: "/test/marchio",
            testGetHost: process.env.AWS_HOST_MARCHIO_GET_SORT, 
            testGetPath: "/test/marchio-get",
            testPutHost: process.env.AWS_HOST_MARCHIO_PUT_SORT, 
            testPutPath: "/test/marchio-put-sort"    
        }
    ];
}