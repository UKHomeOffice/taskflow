const assert = require('assert');
const normaliseComments = require('../../../lib/activitylog/normalise-comments');

describe('normalising the comments in the activity log', () => {

  it('does not affect non-comment activity', () => {
    const activtyLog = [
      {
        id: 'a3ef89f3-ff41-428e-a74e-0cad3d6b8cdb',
        eventName: 'foo',
        event: { ignore: 'me' }
      },
      {
        id: 'd7d07c60-4f05-4a64-a3f6-275a885c2e56',
        eventName: 'bar',
        event: { ignore: 'me' }
      },
      {
        id: '5d732c49-c00a-4bea-bdd9-6a7c3d317528',
        eventName: 'baz',
        event: { ignore: 'me' }
      }
    ];

    assert.deepEqual(normaliseComments(activtyLog), activtyLog, 'it does not modify non-comment activity');
  });

  it('cleans up deleted comments', () => {
    const activtyLog = [
      {
        id: 'a3ef89f3-ff41-428e-a74e-0cad3d6b8cdb',
        eventName: 'delete-comment',
        event: { meta: { id: 'd7d07c60-4f05-4a64-a3f6-275a885c2e56' } }
      },
      {
        id: 'd7d07c60-4f05-4a64-a3f6-275a885c2e56',
        eventName: 'comment',
        event: { meta: { comment: 'an original comment' } },
        comment: 'an original comment'
      }
    ];

    const normalised = normaliseComments(activtyLog);

    assert.equal(normalised[0].deleted, true, 'comment is marked as deleted');
    assert.equal(normalised[0].comment, null, 'comment text has been removed');
    assert.equal(normalised.length, 1, 'delete-comment events are removed from the log');
  });

  it('updates comments', () => {
    const activtyLog = [
      {
        id: 'a3ef89f3-ff41-428e-a74e-0cad3d6b8cdb',
        eventName: 'update-comment',
        event: { meta: { id: 'd7d07c60-4f05-4a64-a3f6-275a885c2e56', comment: 'obsolete update' } },
        comment: 'obsolete update',
        updatedAt: '2019-10-09 12:00:00'
      },
      {
        id: 'a3ef89f3-ff41-428e-a74e-0cad3d6b8cdb',
        eventName: 'update-comment',
        event: { meta: { id: 'd7d07c60-4f05-4a64-a3f6-275a885c2e56', comment: 'most recent update' } },
        comment: 'most recent update',
        updatedAt: '2019-10-09 14:00:00'
      },
      {
        id: 'd7d07c60-4f05-4a64-a3f6-275a885c2e56',
        eventName: 'comment',
        event: { meta: { comment: 'an original comment' } },
        comment: 'an original comment'
      }
    ];

    const normalised = normaliseComments(activtyLog);

    assert.equal(normalised[0].comment, 'most recent update', 'comment text has been updated with the most recent update');
    assert.equal(normalised.length, 1, 'update-comment events are removed from the log');
  });
});
