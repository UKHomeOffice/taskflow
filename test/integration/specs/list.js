const request = require('supertest');
const express = require('express');
const assert = require('assert');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;

describe('GET /', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();
    this.app.use(this.flow);

    return reset()
      .then(() => {
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
