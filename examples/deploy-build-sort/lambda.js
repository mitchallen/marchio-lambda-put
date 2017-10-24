/* ************************
 * DO NOT EDIT AS index.js 
 * Edit lambda.js
 * The file will be copied to index.js for deployment
 */

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

const mlFactory = require('marchio-lambda-put');

var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

/* 
 * Why not just demo hashing with bcrypt?
 * Because bcrypt requires installing on AWS Linux before packaging
 * That's beyond the scope of this example, so we fake it.
 */

function fakeHash( record ) {
    // Not a real hash function - do not use in production
    return new Promise( (resolve, reject) => {
        if(!record) {
            return reject('record not defined');
        } 
        if(record.password) {
            // only update if value passed in
            // fake hashing - do not use in production
            record.password = '$' + getRandomInt(10000, 10000000);
        }
        resolve(record);
    });
}

exports.handler = function(event, context, callback) {

    /*

    curl -i -X PUT -H \"Content-Type: application/json\" \
    -d '{\"email\":\"x@y.com\",\"status\":\"FUBAR\"}' \
     $AWS_HOST_MARCHIO_PUT_SORT/test/marchio-put-sort/mldb-sort/abc/xyz"
  },

    */

    var model = {
        name: 'mldb-sort',   // must match DynamoDB table name
        partition: 'eid',     // primary partition key - cannot be reserved word (like uuid)
        sort: 'gid',        // primary sort key - DynamoDB sort key
        recordMustExist: false, // default is false // x-marchio-error: The conditional request failed
        fields: {
            eid:    { type: String }, // partition key
            // gid:    { type: String }, // sort key
            email:   { type: String, required: true },
            status:   { type: String, required: true, default: "NEW" },
            // In a real world example, password would be hashed by middleware before being saved
            password: { type: String, select: false }  // select: false, exclude from query results
        }
    };

    mlFactory.create({ 
        event: event, 
        context: context,
        callback: callback,
        model: model,
        filter: fakeHash
    })
    .catch(function(err) {
        callback(err);
    });
};