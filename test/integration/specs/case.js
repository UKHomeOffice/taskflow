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
    return Promise.resolve()
      .then(() => {
        return reset();
      })
      .then(() => {
        return Case.query(this.flow.db)
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

    it('applies single decorator to cases', () => {
      this.flow.decorate(c => ({ ...c, decorated: true }));
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
        });
    });

    it('applies multiple decorators to cases', () => {
      this.flow.decorate(c => ({ ...c, decorated: true }));
      this.flow.decorate(c => ({ ...c, decoratedAgain: true }));
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
          assert.equal(response.body.data.decoratedAgain, true, '`decoratedAgain` property is added to the model');
        });
    });

    it('supports asynchronous decorators', () => {
      this.flow.decorate(c => Promise.resolve({ ...c, decorated: true }));
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
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

    it('includes the new status on pre-event hook metadata', () => {
      const stub = sinon.stub().resolves();
      this.flow.hook('pre-status:*:updated', stub);
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated' })
        .expect(200)
        .then(() => {
          assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
          const meta = stub.lastCall.args[0].meta;
          assert.equal(meta.next, 'updated', 'Hook metadata contains the new status');
        });
    });

    it('includes the request payload in the hook metadata when changing status', () => {
      const payload = { status: 'updated', reason: 'some reason' };
      const stub = sinon.stub().resolves();
      this.flow.hook('pre-status:*:*', stub);
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(200)
        .then(() => {
          assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
          const meta = stub.lastCall.args[0].meta;
          assert.deepEqual(meta.payload, payload, 'Hook metadata contains the request payload');
        });
    });

  });

});
