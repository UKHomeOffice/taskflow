const assert = require('assert');

const EventWrapper = require('../../../lib/hooks/event-wrapper');

describe('Hooks EventWrapper', () => {

  describe('properties', () => {

    const model = {
      event: 'create',
      id: '538a42c9-be67-4289-a8be-550c09a78b78',
      meta: {
        data: {
          field: 'value'
        }
      }
    };

    it('exposes the event provided as an `event` property', () => {
      const event = new EventWrapper(model);
      assert.equal(event.event, 'create');
    });

    it('exposes the id provided as an `id` property', () => {
      const event = new EventWrapper(model);
      assert.equal(event.id, '538a42c9-be67-4289-a8be-550c09a78b78');
    });

    it('exposes a `setStatus` function', () => {
      const event = new EventWrapper(model);
      assert.equal(typeof event.setStatus, 'function');
    });

    it('exposes a `redirect` function on pre-create hooks', () => {
      const event = new EventWrapper({ ...model, event: 'pre-create' });
      assert.equal(typeof event.redirect, 'function');
    });

  });

});
