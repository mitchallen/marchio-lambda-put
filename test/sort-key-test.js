/**
    Module: marchio-lambda-put
      Test: sort-key-test
    Author: Mitch Allen
*/

/*jshint node: true */
/*jshint mocha: true */
/*jshint esversion: 6 */

"use strict";

var request = require('supertest'),
    should = require('should'),
    matrix = require('./matrix-sort-key');

var testMatrix = matrix.create({});

var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

describe('deployment sort key test', () => {

    before( done => {
        done();
    });

    after( done => {
        // Call after all tests
        done();
    });

    beforeEach( done => {
        // Call before each test
        done();
    });

    afterEach( done => {
        // Call after each test
        done();
    });

    ///////////////////////////////////////
    // Test each service in a matrix

    testMatrix.forEach(function (el) {

        var matrixKey = el.key,
            service = el.service,
            table = el.table,
            _testPutHost = el.testPutHost,
            _testPutPath = el.testPutPath,
            _testGetHost = el.testGetHost,
            _testGetPath = el.testGetPath,
            _testPostHost = el.testPostHost,
            _testPostPath = el.testPostPath;

        describe(`lambda-dynamo: ${service}`, () => {

            // console.log("MATRIX  vvvvv");
            // console.log(JSON.stringify(el) );
            // console.log("MATRIX  ^^^^^");

            var _testModel = {
                name: 'mldb-sort',   // must match DynamoDB table name
                partition: 'eid',     // primary key - cannot be reserved word (like uuid)
                sort: 'gid',
                fields: {
                    eid:      { type: String },
                    gid:      { type: String },
                    email:    { type: String, required: true },
                    status:   { type: String, required: true, default: "NEW" },
                    // In a real world example, password would be hashed by middleware before being saved
                    password: { type: String, select: false }  // select: false, exclude from query results
                }
            };

            var _postUrl = `${_testPostPath}`;
        
            it('put should succeed', done => {
                const gidValue = "G456";
                const testObject = {
                    gid: gidValue,
                    email: "test" + getRandomInt( 1000, 1000000) + "@smoketest.cloud",
                    password: "fubar"
                };
                var testPutObject = {
                    status: "UPDATE"
                }
                // console.log(`TEST POST HOST: ${_testPostHost} `);
                // console.log(`TEST POST URL: ${_testPostHost}${_postUrl} `);
                // console.log("TEST OBJECT: " + JSON.stringify(testObject) );
                request(_testPostHost)
                    .post(_postUrl)
                    .send(testObject)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .expect('Content-Type', /json/)
                    .expect('Location', /mldb-sort/ )
                    .end(function (err, res) {
                        should.not.exist(err);
                        // console.log("RESPONSE: ", res.body);
                        res.body.email.should.eql(testObject.email);
                        // Should not return password
                        should.not.exist(res.body.password);
                        res.body.status.should.eql("NEW");
                        should.exist(res.body[_testModel.partition]);
                        res.header.location.should.eql(`/${_testModel.name}/${res.body[_testModel.partition]}`)
                        should.exist(res.body.eid);
                        var _saveKey = res.body.eid;
                        var _putUrl = `${_testPutPath}/${_saveKey}/${gidValue}`;
                        // console.log("PUT URL: ", _putUrl );
                        request(_testPutHost)
                            .put(_putUrl)
                            .send(testPutObject)
                            .expect(204)
                            .expect('Location', `/${_testModel.name}/${res.body.eid}` )
                            .end(function (err, res) {
                                should.not.exist(err);
                                var _getUrl = `${_testGetPath}/${_saveKey}/${gidValue}`;
                                // console.log("GET HOST: ", _testGetHost);
                                // console.log("GET URL: ", _getUrl);
                                request(_testGetHost)
                                    .get(_getUrl)
                                    .expect(200)
                                    .end(function(err,res){
                                         // console.log(res.body);
                                        res.body.email.should.eql(testObject.email);
                                        // Should not return password
                                        should.not.exist(res.body.password);
                                        res.body.status.should.eql(testPutObject.status);
                                        should.exist(res.body.eid);
                                        res.body.eid.should.eql(_saveKey);
                                        done();
                                    });
                            });
                    });
            });

            it('put should not set non-model field', done => {
                const gidValue = "GABC123";
                var testObject = {
                    gid: gidValue,
                    email: "test" + getRandomInt( 1000, 1000000) + "@smoketest.cloud",
                    password: "fubar"
                };
                var testPutObject = {
                    status: "UPDATE",
                    bogus: "This should not be added"
                }
                // console.log(`TEST HOST: ${_testPostHost} `);
                // console.log(`TEST URL: ${_testPostHost}${_postUrl} `);
                request(_testPostHost)
                    .post(_postUrl)
                    .send(testObject)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .expect('Content-Type', /json/)
                    .expect('Location', /mldb-sort/ )
                    .end(function (err, res) {
                        should.not.exist(err);
                        // console.log("RESPONSE: ", res.body);
                        var _saveKey = res.body.eid;
                        var _putUrl = `${_testPutPath}/${_saveKey}/${gidValue}`;
                        // console.log("PUT URL: ", _getUrl );
                        request(_testPutHost)
                            .put(_putUrl)
                            .send(testPutObject)
                            .expect(204)
                            .expect('Location', `/${_testModel.name}/${res.body.eid}` )
                            .end(function (err, res) {
                                should.not.exist(err);
                                var _getUrl = `${_testGetPath}/${_saveKey}/${gidValue}`;
                                // console.log(_getUrl);
                                request(_testGetHost)
                                    .get(_getUrl)
                                    .expect(200)
                                    .end(function(err,res){
                                         // console.log(res.body);
                                        should.not.exist(res.body.bogus);
                                        done();
                                    });
                            });
                    });
            });

            it('put with invalid model id in url should return 404', done => {
                // console.log(`TEST HOST: ${_testPostHost} `);
                var _invalidPutUrl = `${_testPutPath}/${_testModel.name}/bogus`;
                request(_testPutHost)
                    .put(_invalidPutUrl)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .end(function (err, res) {
                        done();
                    });
            });
        });
    });
});