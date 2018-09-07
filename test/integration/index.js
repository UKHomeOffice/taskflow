const request = require('supertest');
const express = require('express');
const assert = require('assert');

const Taskflow = require('../../');
const Case = require('../../lib/db/case');

const reset = require('./utils/reset-database');

describe('Integration', () => {

  beforeEach(() => {
    this.app = express();
    this.app.use(Taskflow());

    return reset();
  });

  describe('GET /', () => {

    beforeEach(() => {
      return Promise.all([
        Case.query()
          .insert({
            id: 'a',
            status: 'new',
            data: {
              test: 'data1'
            }
          }),
        Case.query()
          .insert({
            id: 'b',
            status: 'new',
            data: {
              test: 'data2'
            }
          })
      ]);
    });

    it('responds 200', () => {
      return request(this.app)
        .get('/')
        .expect(200);
    });

    it('returns a list of records in the database', () => {
      return request(this.app)
        .get('/')
        .expect(response => {
          assert.equal(response.body.data.length, 2, '2 records are returned');
          assert.deepEqual(response.body.data.map(o => o.id), ['a', 'b']);
        });
    });

  });

  describe('POST /', () => {

    it('responds 200', () => {

      return request(this.app)
        .post('/')
        .send({ test: 'data' })
        .expect(200);
    });

    it('inserts a record into the database', () => {

      return Promise.resolve()
        .then(() => {
          return request(this.app)
            .post('/')
            .set('Content-type', 'application/json')
            .send({ test: 'data' })
            .expect(200);
        })
        .then(() => {
          return request(this.app)
            .get('/')
            .expect(200)
            .expect(response => {
              assert.equal(response.body.data.length, 1, '1 record is returned');
            });
        });
    });

  });

});
