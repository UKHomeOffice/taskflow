const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const assert = require('assert');

const Taskflow = require('../../../');
const Task = require('../../../lib/db/task');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;
const id = '538a42c9-be67-4289-a8be-550c09a78b78';

describe('Hooks', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();
    this.app.use(this.flow);
    this.app.use((err, req, res, next) => {
      console.error(err);
      next(err);
    });
    return reset()
      .then(() => {
        return Task.query(this.flow.db)
          .insert({
            id,
            status: 'new',
            data: {
              test: 'data'
            }
          });
      });
  });

  afterEach(done => {
    this.flow.db.destroy(done);
  });

  describe('EventWrapper', () => {

    describe('create hooks', () => {

      it('has an `event` property', () => {
        const prestub = sinon.stub().returns(Promise.resolve());
        const poststub = sinon.stub().returns(Promise.resolve());
        this.flow.hook('pre-create', prestub);
        this.flow.hook('create', poststub);

        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(response => {
            assert.equal(prestub.calledOnce, true, 'Hook was called exactly once');
            assert.equal(poststub.calledOnce, true, 'Hook was called exactly once');
            const preevent = prestub.firstCall.args[0];
            const postevent = poststub.firstCall.args[0];
            assert(preevent.hasOwnProperty('event'), 'Event argument has an `event` property');
            assert.equal(preevent.event, 'pre-create', 'Event property is `pre-create`');
            assert(postevent.hasOwnProperty('event'), 'Event argument has an `event` property');
            assert.equal(postevent.event, 'create', 'Event property is `create`');
          });
      });

      it('hooks are called with an object with id property', () => {
        const stub = sinon.stub().returns(Promise.resolve());
        this.flow.hook('create', stub);
        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(response => {
            assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
            const event = stub.firstCall.args[0];
            assert(event.hasOwnProperty('id'), 'Event argument has an id property');
            assert.equal(event.id, response.body.data.id, 'Event id matches created model id');
          });
      });

      it('contains the created data as meta on pre-create hooks', () => {
        const stub = sinon.stub().returns(Promise.resolve());
        this.flow.hook('pre-create', stub);
        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(response => {
            assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
            const event = stub.firstCall.args[0];
            assert(event.hasOwnProperty('meta'), 'Event argument has a meta property');
            assert(event.meta.hasOwnProperty('data'), 'Event meta argument has a data property');
            assert.deepEqual(event.meta.data, { test: 'data' }, 'meta.data property matches the proposed creation model');
          });
      });

      it('exposes a `status` method that can update case status on create hook', () => {
        this.flow.hook('create', c => c.setStatus('triaged'));
        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(200)
          .expect(response => {
            assert.equal(response.body.data.status, 'triaged', 'Status has been updated');
            return request(this.app)
              .get(`/${response.body.data.id}`)
              .expect(200)
              .expect(response => {
                assert.equal(response.body.data.status, 'triaged', 'Status has been updated');
              });
          });
      });

      it('exposes an `update` method that can update case data on create hook', () => {
        this.flow.hook('create', c => c.update({ test: 'something else' }));
        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(200)
          .expect(response => {
            assert.deepEqual(response.body.data.data, { test: 'something else' });
            return request(this.app)
              .get(`/${response.body.data.id}`)
              .expect(200)
              .expect(response => {
                assert.deepEqual(response.body.data.data, { test: 'something else' });
              });
          });
      });

      it('`update` will remove reset data to new state', () => {
        this.flow.hook('create', c => c.update({ replaced: 'state' }));
        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(200)
          .expect(response => {
            assert.deepEqual(response.body.data.data, { replaced: 'state' });
            return request(this.app)
              .get(`/${response.body.data.id}`)
              .expect(200)
              .expect(response => {
                assert.deepEqual(response.body.data.data, { replaced: 'state' });
              });
          });
      });

      it('exposes a `patch` method that can update case data  without removing existing properties ', () => {
        this.flow.hook('create', c => c.patch({ patched: 'state' }));
        return request(this.app)
          .post('/')
          .send({ test: 'data' })
          .expect(200)
          .expect(response => {
            assert.deepEqual(response.body.data.data, { test: 'data', patched: 'state' });
            return request(this.app)
              .get(`/${response.body.data.id}`)
              .expect(200)
              .expect(response => {
                assert.deepEqual(response.body.data.data, { test: 'data', patched: 'state' });
              });
          });
      });

      it('exposes a `redirect` method on pre-create that will prevent further execution of hooks and respond with value provided', () => {
        const stub = sinon.stub();
        this.flow.hook('pre-create', c => c.redirect({ id }));
        this.flow.hook('create', stub);
        return request(this.app)
          .post('/')
          .send({ test: 'redirect' })
          .expect(200)
          .expect(response => {
            assert.deepEqual(response.body.data.id, id);
            assert.deepEqual(response.body.data.data, { test: 'data' });
            assert.equal(stub.called, false);
            return Task.query(this.flow.db)
              .then(results => {
                assert.equal(results.length, 1, 'No new record should have been created');
              });
          });
      });

      it('throws if a `redirect` is called in a non-pre-create hook', () => {
        this.flow.hook('create', c => c.redirect({ id }));
        return request(this.app)
          .post('/')
          .send({ test: 'redirect' })
          .expect(500);
      });

    });

  });

});
