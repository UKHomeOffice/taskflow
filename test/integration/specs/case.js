const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const assert = require('assert');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;
const id = '538a42c9-be67-4289-a8be-550c09a78b78';

describe('/:case', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();
    this.app.use(this.flow);

    return reset()
      .then(() => {
        return Case.query()
          .insert({
            id,
            status: 'new',
            data: {
              test: 'data'
            }
          });
      });
  });

  describe('GET /:case', () => {

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

  describe('PUT /:case', () => {

    it('responds 200 for a valid id', () => {
      return request(this.app)
        .put(`/${id}`)
        .set('Content-type', 'application/json')
        .send({ test: 'updated' })
        .expect(200);
    });

    it('responds 404 for an unknown id', () => {
      return request(this.app)
        .put('/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
        .set('Content-type', 'application/json')
        .send({ test: 'updated' })
        .expect(404);
    });

    it('returns the model', () => {
      return request(this.app)
        .put(`/${id}`)
        .set('Content-type', 'application/json')
        .send({ test: 'updated' })
        .expect(response => {
          assert.equal(response.body.data.id, id, '`id` property is present and correct');
          assert.equal(response.body.data.status, 'new', '`status` property is present and correct');
          assert.deepEqual(response.body.data.data, { test: 'updated' }, '`data` property is present and correct');
        });
    });

    it('updated data is saved to the database', () => {
      return request(this.app)
        .put(`/${id}`)
        .set('Content-type', 'application/json')
        .send({ test: 'updated' })
        .then(() => {
          return request(this.app)
            .get(`/${id}`)
            .expect(200)
            .expect(response => {
              assert.equal(response.body.data.id, id, '`id` property is present and correct');
              assert.equal(response.body.data.status, 'new', '`status` property is present and correct');
              assert.deepEqual(response.body.data.data, { test: 'updated' }, '`data` property is present and correct');
            });
        });
    });

  });

  describe('PUT /:case/status', () => {

    it('responds 200 for a valid id', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .expect(200);
    });

    it('responds 404 for an unknown id', () => {
      return request(this.app)
        .put('/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/status')
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .expect(404);
    });

    it('responds 400 if status param is not provided', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({})
        .expect(400);
    });

    it('responds 400 if status param contains spaces', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'one two' })
        .expect(400);
    });

    it('responds 400 if status param contains non-alphabetical characters', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'abc123' })
        .expect(400);
    });

    it('updates the status of the case record', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .then(() => {
          return request(this.app)
            .get(`/${id}`)
            .expect(response => {
              assert.equal(response.body.data.status, 'updated', 'Status is updated to `updated`');
            });
        });
    });

    it('returns the model', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .expect(response => {
          assert.equal(response.body.data.id, id, '`id` property is present and correct');
          assert.equal(response.body.data.status, 'updated', '`status` property is present and correct');
          assert.deepEqual(response.body.data.data, { test: 'data' }, '`data` property is present and correct');
        });
    });

    it('triggers status update hooks', () => {
      const stub = sinon.stub().resolves();
      this.flow.hook('status:new:updated', stub);
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .expect(200)
        .then(() => {
          assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
        });
    });

    it('triggers status update hooks with wildcards', () => {
      const stub = sinon.stub().resolves();
      this.flow.hook('status:*:updated', stub);
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .expect(200)
        .then(() => {
          assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
        });
    });

  });

});
