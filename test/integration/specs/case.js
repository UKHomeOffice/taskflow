const request = require('supertest');
const express = require('express');
const assert = require('assert');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;

describe('Integration - /:case', () => {

  beforeEach(() => {
    this.flow = Taskflow(settings.connection);
    this.app = express();
    this.app.use(this.flow);

    return reset();
  });

  describe('GET /:case', () => {

    let id = '538a42c9-be67-4289-a8be-550c09a78b78';

    beforeEach(() => {
      return Case.query()
        .insert({
          id,
          status: 'new',
          data: {
            test: 'data'
          }
        });
    });

    it('responds 200 for a valid id', () => {
      return request(this.app)
        .get(`/${id}`)
        .expect(200);
    });

    it('responds 404 for an unknown id', () => {
      return request(this.app)
        .get('/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
        .expect(404);
    });

    it('returns the model', () => {
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.id, id, '`id` property is present and correct');
          assert.equal(response.body.data.status, 'new', '`status` property is present and correct');
          assert.deepEqual(response.body.data.data, { test: 'data' }, '`data` property is present and correct');
        });
    });

  });

});
