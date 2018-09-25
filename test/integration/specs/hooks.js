const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const assert = require('assert');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');

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

    });

  });

});
