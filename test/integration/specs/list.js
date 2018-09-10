const request = require('supertest');
const express = require('express');
const assert = require('assert');
const sinon = require('sinon');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;

describe('Integration - /', () => {

  beforeEach(() => {
    this.flow = Taskflow(settings.connection);
    this.app = express();
    this.app.use(this.flow);

    return reset();
  });

  describe('GET /', () => {

    beforeEach(() => {
      return Promise.all([
        Case.query()
          .insert({
            id: '0ddfea8d-31d9-4258-a545-b403a3fc4864',
            status: 'new',
            data: {
              test: 'data1'
            }
          }),
        Case.query()
          .insert({
            id: '56119f73-1477-4ddc-8f79-88adb3386775',
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
          assert.deepEqual(response.body.data.map(o => o.id), [
            '0ddfea8d-31d9-4258-a545-b403a3fc4864',
            '56119f73-1477-4ddc-8f79-88adb3386775'
          ]);
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

    it('triggers any `create` hooks', () => {
      const stub = sinon.stub().resolves();
      this.flow.hook('create', stub);

      return Promise.resolve()
        .then(() => {
          return request(this.app)
            .post('/')
            .set('Content-type', 'application/json')
            .send({ test: 'data' })
            .expect(200);
        })
        .then(() => {
          assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
        });
    });

  });

});
