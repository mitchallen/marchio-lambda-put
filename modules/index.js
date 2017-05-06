/**
    Module: marchio-lambda-put
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

require('dotenv').config();

var adapterFactory = require('@mitchallen/lambda-adapter');
var putFactory = require('./db-put');

/**
 * Module
 * @module marchio-lambda-put
 */

/**
 * 
 * Factory module
 * @module marchio-lambda-put-factory
 */

 /** 
 * Factory method 
 * It takes one spec parameter that must be an object with named parameters
 * @param {Object} spec Named parameters object
 * @param {Object} spec.event Lambda event
 * @param {Object} spec.context Lambda context
 * @param {function} spec.callback Lambda callback
 * @param {Object} spec.model - Table model
 * @param {function} [spec.filter] - A function that takes the original record and returns a {Promise} that resolves to a filtered record
 * @returns {Promise} that resolves to {module:marchio-lambda-put}
 * @example <caption>Usage example</caption>
 * // Lambda root file
 * "use strict";
 * 
 * var mlFactory = require('marcio-lambda-put'); 
 *
 * var getRandomInt = function (min, max) {
 *     return Math.floor(Math.random() * (max - min + 1) + min);
 * };
 * 
 * // Why not just demo hashing with bcrypt?
 * // Because bcrypt requires installing on AWS Linux before packaging
 * // That's beyond the scope of this example, so we fake it.
 *  
 * function fakeHash( record ) {
 *    // Not a real hash function - do not use in production
 *    return new Promise( (resolve, reject) => {
 *        if(!record) {
 *            return reject('record not defined');
 *        } 
 *        if(record.password) {
 *            // only update if value passed in
 *            // fake hashing - do not use in production
 *            record.password = '$' + getRandomInt(10000, 10000000);
 *        }
 *        resolve(record);
 *    });
 * }
 * 
 * exports.handler = function(event, context, callback) {
 * 
 *     var model = {
 *         name: 'mldb',   // must match DynamoDB table name
 *         primary: 'eid', // primary key - cannot be reserved word (like uuid)
 *         fields: {
 *             email:    { type: String, required: true },
 *             status:   { type: String, required: true, default: "NEW" },
 *             // Password will be (fake) hashed by filter before being saved
 *             password: { type: String, select: false },  // select: false, exclude from query results
 *         }
 *     };
 * 
 *     mlFactory.create({ 
 *         event: event, 
 *         context: context,
 *         callback: callback,
 *         model: model,
 *         filter: fakeHash
 *     })
 *     .catch(function(err) {
 *         callback(err);
 *     });
 *  };
 */
module.exports.create = (spec) => {

    spec = spec || {};

    if(!spec.event) {
        return Promise.reject("event parameter not set");
    }

    if(!spec.context) {
        return Promise.reject("context parameter not set");
    }

    if(!spec.context.functionName) {
        return Promise.reject("context.functionName parameter not defined");
    }

    if(!spec.callback) {
        return Promise.reject("callback parameter not set");
    }

    if(!spec.model) {
        return Promise.reject("model parameter not set");
    }

    spec.regex = `/${spec.context.functionName}/:model/:id`;

    const marchio = spec;

    return  adapterFactory.create(spec)
            .then( (adapter) => {
                return putFactory.create({ 
                    adapter: adapter,
                    marchio: marchio 
                });
            })
            .catch(function(err) {
                spec.callback(err);
            });
};