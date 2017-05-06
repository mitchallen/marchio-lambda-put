/**
    Module: db-put.js
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

const doc = require('dynamodb-doc'),
    docClient = doc ? new doc.DynamoDB() : null,
    crFactory = require('marchio-core-record'),
    path = '/:model';

function defaultFilter( record ) {
    return new Promise( (resolve, reject) => {
        if(!record) {
            return reject('record not defined');
        }
        resolve(record);
    });
}

module.exports.create = ( spec ) => {

    spec = spec || {};

    const adapter = spec.adapter,
          marchio = spec.marchio;

    const model = marchio.model,
          filter = marchio.filter || defaultFilter;

    const query = adapter.query,
          params = adapter.params,
          method = adapter.method,
          body = adapter.body,
          res = adapter.response,
          env = adapter.env;

    const primaryKey = model.primary,
          jsonp = query.jsonp || false,
          cb = query.cb || 'callback';

    var recMgr = null,
        idMgr = null,
        eMsg = '';

    var req = {
        method: method,
        query: query,
        params: params,
        body: body
    };

    var _code = 200;
    var _headers = {
        "Content-Type" : "application/json"
    };

    if(method !== 'PUT') {
        var resObject = {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json",
                "x-marchio-http-method": method,
                "x-marchio-error": "HTTP Method not supported"
            },
            body: {} 
        };
        res.json(resObject);
        return;
    }

    // TODO - check primaryKey against DynamoDB reserved words
    if(!primaryKey) {
        throw new Error('dp-put: model.primary not defined.');
    }

    return crFactory.create( { model: model } )
    .then( o => {
        recMgr = o;  
        return recMgr.buildUpdate( req.body );   // build update record
    })
    .then( o => {
        var record = o;
        if( ! record ) {    // record failed validation
            throw new Error('dp-put: record failed validation.');
            // return Promise.reject(404);
        }
        var dbId = params.id;
        if(!dbId) {
            throw new Error('dp-put: dbId not found.');
            // return Promise.reject(404);
        }
        record[primaryKey] = dbId;
        return Promise.all([
            filter( record ),
            Promise.resolve( dbId )
        ]);
    })
    .then( o => {
        var record = o[0],
            dbId = o[1],
            _key = {},
            _updateExpression = "SET ",
            _expAttrValues = {},
            _expAttrNames = {},
            pCount = 0;

        _key[ primaryKey ] = dbId;

        for (var property in record) { 
            if (record.hasOwnProperty(property)) {
                if( property === primaryKey ) {
                    /*
                     * "One or more parameter values were invalid: Cannot update attribute eid. 
                     * This attribute is part of the key","err":{"message":"One or more parameter 
                     * values were invalid: Cannot update attribute eid. This attribute is part of the key"
                     */
                    continue;
                }
                pCount++;
                var value = record[property];
                var _fldName = '#' + property;
                var _fldLabel = ':' + property;
                _updateExpression += pCount == 1 ? "" : ", ";
                _updateExpression += `${_fldName} = ${_fldLabel}`;
                _expAttrNames[ _fldName ] = property;
                _expAttrValues[ _fldLabel ] = value;
            }
        }

        var putObject = {
            "TableName": model.name,
            "Key": _key,
            "ConditionExpression": `attribute_exists(${primaryKey})`,
            "UpdateExpression":  _updateExpression, // "SET #email = :email, #status = :status",
            "ExpressionAttributeValues": _expAttrValues,
            // "ExpressionAttributeValues": {
            //     ":email": "myupdatetest@test.com",
            //     ":status": "MOD_TEST"
            // },
            "ExpressionAttributeNames": _expAttrNames   // object { '#email': "email" }
            // "ExpressionAttributeNames": { 
            //     '#email': "email",
            //     '#status': "status",
            // }
        };
        return Promise.all([
                docClient.updateItem( putObject ).promise(),
                Promise.resolve( dbId )
            ]);
    })
    .then( (o) => {
        var data = o[0],
            dbId = o[1];
        var resObject = {
            statusCode: 204, // not returning data 
            headers: {
                "Content-Type" : "application/json",
                "Location": "/" + [ model.name, dbId ].join('/')
            },
            body: {}    // 204 - not returning data
        };
        res
            .json(resObject);
    })
    .catch( (err) => {  
        if(err) {
            if( err === 404 ) {
                res.json({
                    statusCode: 404
                });
            } else {
                res.json({
                    statusCode: 500,
                    body: { 
                        message: err.message, 
                        err: err
                    }
                });
            }
        } 
    });
};