const sinon = require('sinon');
const EventWrapper = require('../../../../lib/hooks/event-wrapper');
const ActivityLog = require('../../../../lib/db/activity-log');
const logger = require('../../../../lib/activitylog/hooks/logger');

describe('Hooks Activity Logger', () => {
  const model = {
    event: 'create',
    id: '538a42c9-be67-4289-a8be-550c09a78b78',
    meta: {
      user: {
        id: '538a42c9-be67-4289-a8be-guh49gh4gh9'
      },
      payload: {
        status: 'foo',
        comment: 'some reason'
      }
    },
    transaction: {}
  };

  const event = new EventWrapper(model);
  const hook = logger();

  it('records events in an activity log', () => {
    const query = sinon.spy(ActivityLog, 'query');
    hook(event);
    sinon.assert.calledOnce(query);
  });
});
