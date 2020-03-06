const request = require('supertest');
const express = require('express');
const assert = require('assert');
const sinon = require('sinon');

const Taskflow = require('../../../');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;

describe('POST /', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();
    this.app.use(this.flow);
    return reset();
  });

  afterEach(done => {
    this.flow.db.destroy(done);
  });

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

  it('triggers any `pre-create` hooks', () => {
    const stub = sinon.stub().resolves();
    this.flow.hook('pre-create', stub);

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

  it('will not insert a record if the `pre-create` hook fails', () => {
    const stub = sinon.stub().rejects(new Error('Test'));
    this.flow.hook('pre-create', stub);

    return Promise.resolve()
      .then(() => {
        return request(this.app)
          .post('/')
          .set('Content-type', 'application/json')
          .send({ test: 'data' })
          .expect(500);
      })
      .then(() => {
        return request(this.app)
          .get('/')
          .expect(response => {
            assert.deepEqual(response.body.data, [], 'No records are returned from lookup');
          });
      });
  });

  it('will not insert a record if the `create` hook fails', () => {
    const stub = sinon.stub().rejects(new Error('Test'));
    this.flow.hook('create', stub);

    return Promise.resolve()
      .then(() => {
        return request(this.app)
          .post('/')
          .set('Content-type', 'application/json')
          .send({ test: 'data' })
          .expect(500);
      })
      .then(() => {
        return request(this.app)
          .get('/')
          .expect(response => {
            assert.deepEqual(response.body.data, [], 'No records are returned from lookup');
          });
      });
  });

  it('will not call `create` hooks if the `pre-create` hook fails', () => {
    const pre = sinon.stub().rejects(new Error('Test'));
    const post = sinon.stub().resolves();
    this.flow.hook('pre-create', pre);
    this.flow.hook('create', post);

    return Promise.resolve()
      .then(() => {
        return request(this.app)
          .post('/')
          .set('Content-type', 'application/json')
          .send({ test: 'data' })
          .expect(500);
      })
      .then(() => {
        assert.equal(pre.calledOnce, true, 'Pre-hook was called exactly once');
        assert.equal(post.calledOnce, false, 'Post-hook was not called');
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

  it('applies decorators to the returned data', () => {
    this.flow.decorate(c => {
      return {
        ...c,
        data: { ...c.data, upper: c.data.test.toUpperCase() }
      };
    });
    return Promise.resolve()
      .then(() => {
        return request(this.app)
          .post('/')
          .set('Content-type', 'application/json')
          .send({ test: 'data' })
          .expect(200)
          .expect(response => {
            assert.equal(response.body.data.data.upper, 'DATA');
          });
      });
  });

});
