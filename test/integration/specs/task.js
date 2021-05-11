const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const assert = require('assert');
const moment = require('moment');

const Taskflow = require('../../../');
const Task = require('../../../lib/db/task');
const ActivityLog = require('../../../lib/db/activity-log');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;
const id = '538a42c9-be67-4289-a8be-550c09a78b78';
const authorId = '28cc77ea-ca08-4dd7-b0ad-087856f34272';

describe('/:task', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();

    this.app.use((req, res, next) => {
      if (req.header('X-Profile-Id')) {
        req.user = {
          profile: {
            id: req.header('X-Profile-Id')
          }
        };
      }
      next();
    });

    this.app.use(this.flow);

    return Promise.resolve()
      .then(() => {
        return reset();
      })
      .then(() => {
        return Task.query(this.flow.db)
          .insert({
            id,
            status: 'new',
            data: {
              test: 'data'
            }
          });
      })
      .then(() => {
        return ActivityLog.query(this.flow.db)
          .insertAndFetch({
            caseId: id,
            eventName: 'comment',
            changedBy: authorId,
            event: {
              meta: {
                comment: 'an original comment',
                payload: {
                  meta: {
                    field: 'title'
                  }
                }
              }
            },
            comment: 'an original comment'
          })
          .then(comment => {
            this.originalComment = comment;
          });
      });
  });

  afterEach(done => {
    this.flow.db.destroy(done);
  });

  describe('GET /:task', () => {

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

    it('applies single decorator to tasks', () => {
      this.flow.decorate(task => ({ ...task, decorated: true }));
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
        });
    });

    it('applies multiple decorators to tasks', () => {
      this.flow.decorate(task => ({ ...task, decorated: true }));
      this.flow.decorate(task => ({ ...task, decoratedAgain: true }));
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
          assert.equal(response.body.data.decoratedAgain, true, '`decoratedAgain` property is added to the model');
        });
    });

    it('supports asynchronous decorators', () => {
      this.flow.decorate(task => Promise.resolve({ ...task, decorated: true }));
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
        });
    });

    it('includes decorators configured with `list: false`', () => {
      this.flow.decorate(task => ({ ...task, decorated: true }));
      this.flow.decorate(task => ({ ...task, decoratedAgain: true }));
      this.flow.decorate(task => ({ ...task, decoratedList: true }), { list: false });
      return request(this.app)
        .get(`/${id}`)
        .expect(response => {
          assert.equal(response.body.data.decorated, true, '`decorated` property is added to the model');
          assert.equal(response.body.data.decoratedAgain, true, '`decoratedAgain` property is added to the model');
          assert.equal(response.body.data.decoratedList, true, '`decoratedList` property is added to the model');
        });
    });

  });

  describe('PUT /:task', () => {

    it('responds 200 for a valid id', () => {
      return request(this.app)
        .put(`/${id}`)
        .set('Content-type', 'application/json')
        .send({ data: { test: 'updated' } })
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
        .send({ data: { test: 'updated' } })
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
        .send({ data: { test: 'updated' } })
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

  describe('PUT /:task/status', () => {

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
      const payload = { status: 'updated', meta: { comment: 'some reason' } };
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
          assert.deepEqual(meta.payload.meta, payload.meta, 'Hook metadata contains the request payload metadata');
        });
    });

    it('triggers the activity log hook', () => {
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated', meta: { comment: 'testing the activity log' } })
        .expect(200)
        .then(() => {
          return ActivityLog.query(this.flow.db).findOne({ comment: 'testing the activity log' })
            .then(log => {
              assert.equal(log.eventName, 'status:new:updated', 'Activity log records each event');
            });
        });
    });

    it('doesn\'t add batched timestamps to activity log entries (regression)', () => {
      this.flow.hook('status:*:updated', model => model.patch({ data: { thing: 'updated' } }));
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send({ status: 'updated', meta: { comment: 'testing the activity log' } })
        .expect(200)
        .then(() => {
          return ActivityLog.query(this.flow.db).where({ comment: 'testing the activity log' })
            .then(logs => {
              assert.ok(!moment(logs[0].createdAt).isSame(moment(logs[1].createdAt)));
            });
        });
    });

    it('rolls back status change if hook fails', () => {
      const payload = { status: 'updated', meta: { comment: 'some reason' } };
      const stub = sinon.stub().rejects(new Error('test'));
      this.flow.hook('status:*:*', stub);
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(500)
        .then(() => {
          return request(this.app)
            .get(`/${id}`)
            .expect(200)
            .expect(response => {
              assert.equal(response.body.data.status, 'new', 'The status should still be "new"');
              assert.equal(response.body.data.activityLog.length, 1, 'No new activity should have been added');
            });
        });
    });

    it('rolls back status change if a secondary hook fails', () => {
      const payload = { status: 'first', meta: { comment: 'some reason' } };
      const stub = sinon.stub().rejects(new Error('test'));
      this.flow.hook('status:*:first', m => m.setStatus('second'));
      this.flow.hook('status:*:second', stub);
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(500)
        .then(() => {
          return request(this.app)
            .get(`/${id}`)
            .expect(200)
            .expect(response => {
              assert.equal(response.body.data.status, 'new', 'The status should still be "new"');
              assert.equal(response.body.data.activityLog.length, 1, 'No new activity should have been added');
            });
        });
    });

    it('adds a request id to the transaction and persists through all steps in the request', () => {
      const payload = { status: 'first', meta: { comment: 'some reason' } };
      this.flow.hook('status:*:first', m => m.setStatus('second'));
      this.flow.hook('status:*:second', m => m.setStatus('third'));
      return request(this.app)
        .put(`/${id}/status`)
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(200)
        .then(() => {
          return request(this.app)
            .get(`/${id}`)
            .expect(200)
            .expect(response => {
              assert.equal(response.body.data.status, 'third', 'The status should have been updated to third');
              const statusLogs = response.body.data.activityLog.filter(log => log.id !== this.originalComment.id);
              const ids = statusLogs.map(log => log.event.req);
              assert.ok(ids.every((val, i, arr) => val === arr[0]), 'request ids should match');
            });
        });
    });

  });

  describe('POST /:task/comment', () => {

    it('triggers comment hook', () => {
      const comment = 'testing add another comment';
      const payload = { comment, meta: { comment, field: 'title' } };

      return request(this.app)
        .post(`/${id}/comment`)
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(200)
        .then(() => {
          return ActivityLog.query(this.flow.db).findOne({ eventName: 'comment', comment })
            .then(log => {
              assert.equal(log.event.meta.comment, comment, 'Comment is stored in the event metadata');
              assert.deepEqual(log.event.meta.payload, payload, 'Payload is stored in the log event');
            });
        });
    });

    it('does not add comment if comment hook fails', () => {
      const comment = 'testing add another comment';
      const payload = { comment, meta: { comment, field: 'title' } };
      const stub = sinon.stub().rejects(new Error('test'));
      this.flow.hook('comment', stub);
      return request(this.app)
        .post(`/${id}/comment`)
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(500)
        .then(() => {
          return ActivityLog.query(this.flow.db).findOne({ eventName: 'comment', comment })
            .then(log => {
              assert.ok(!log, 'No comment should have been added');
            });
        });
    });

  });

  describe('PUT /:task/comment/:id', () => {

    it('throws an error if the user is not the author', () => {
      const comment = 'testing update comment';
      const payload = { comment, meta: { comment } };

      return request(this.app)
        .put(`/${id}/comment/${this.originalComment.id}`)
        .set('Content-type', 'application/json')
        .set('X-Profile-Id', 'not-the-author-id')
        .send(payload)
        .expect(403);
    });

    it('triggers the update-comment hook', () => {
      const comment = 'testing update comment';
      const payload = { comment, meta: { comment } };

      return request(this.app)
        .put(`/${id}/comment/${this.originalComment.id}`)
        .set('Content-type', 'application/json')
        .set('X-Profile-Id', authorId)
        .send(payload)
        .expect(200)
        .then(() => {
          return ActivityLog.query(this.flow.db).findOne({ eventName: 'update-comment' })
            .then(log => {
              assert.equal(log.event.meta.comment, comment, 'Update comment event was created with the new comment text');
              assert.equal(log.event.meta.id, this.originalComment.id, 'Has a reference to the comment being updated');
            });
        });
    });

  });

  describe('DELETE /:task/comment/:id', () => {

    it('throws an error if the user is not the author', () => {
      return request(this.app)
        .delete(`/${id}/comment/${this.originalComment.id}`)
        .set('Content-type', 'application/json')
        .set('X-Profile-Id', 'not-the-author-id')
        .expect(403);
    });

    it('triggers the delete-comment hook', () => {
      return request(this.app)
        .delete(`/${id}/comment/${this.originalComment.id}`)
        .set('Content-type', 'application/json')
        .set('X-Profile-Id', authorId)
        .expect(200)
        .then(() => {
          return ActivityLog.query(this.flow.db).findOne({ eventName: 'delete-comment' })
            .then(log => {
              assert.equal(log.event.meta.id, this.originalComment.id, 'Has a reference to the comment being deleted');
            });
        });
    });

  });

  describe('PUT /:task/assign', () => {

    it('sets the assignedTo property of the task', () => {
      const profileId = 'abc-123';
      return request(this.app)
        .put(`/${id}/assign`)
        .set('Content-type', 'application/json')
        .send({ profileId })
        .expect(() => {
          return Task.query(this.flow.db).findById(id)
            .then(result => {
              assert.equal(result.assignedTo, profileId);
            });
        });
    });

    it('triggers `assign` hooks', () => {
      const profileId = 'abc-123';
      const stub = sinon.stub().resolves();
      this.flow.hook('assign', stub);
      return request(this.app)
        .put(`/${id}/assign`)
        .set('Content-type', 'application/json')
        .send({ profileId })
        .expect(200)
        .then(() => {
          assert.equal(stub.calledOnce, true, 'Hook was called exactly once');
        });
    });

    it('does not update the `updatedAt` timestamp on the task', () => {
      const profileId = 'abc-123';
      return Task.query(this.flow.db).findById(id)
        .then(before => {
          return request(this.app)
            .put(`/${id}/assign`)
            .set('Content-type', 'application/json')
            .send({ profileId })
            .expect(200)
            .then(() => {
              return Task.query(this.flow.db).findById(id)
                .then(after => {
                  assert.deepEqual(before.updatedAt, after.updatedAt);
                });
            });
        });
    });

  });
});
