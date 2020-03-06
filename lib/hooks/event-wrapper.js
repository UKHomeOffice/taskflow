const { get } = require('lodash');
const Task = require('../models/task');
const { TERMINATED } = require('../constants');

class EventWrapper {

  constructor({ id, meta = {}, event }) {
    this.id = id;
    this.meta = meta;
    this.event = event;
    this.comment = meta.comment || get(meta, 'payload.meta.comment');

    Object.defineProperty(this, 'isPreStatusHook', { value: !!event.match(/^pre-status/) });
    Object.defineProperty(this, 'isPreUpdateHook', { value: !!event.match(/^pre-update/) });
    Object.defineProperty(this, 'isPreCreateHook', { value: !!event.match(/^pre-create/) });
  }

  populate() {
    if (this.event === 'pre-create') {
      return Promise.resolve();
    }
    return Task.find(this.id)
      .then(model => {
        return model.toJSON();
      })
      .then(model => {
        this.status = model.status;
        this.data = model.data;
      });
  }

  setStatus(status) {
    if (this.isPreCreateHook) {
      return console.error('WARNING: cannot modify case models in pre-create hooks.');
    }
    if (this.isPreStatusHook) {
      return console.error('WARNING: cannot modify case models in pre-status hooks.');
    }
    return Task.find(this.id)
      .then(model => {
        return model.status(status, { ...this.meta });
      });
  }

  update(data) {
    if (this.isPreCreateHook) {
      return console.error('WARNING: cannot modify case models in pre-create hooks.');
    }
    if (this.isPreUpdateHook) {
      return console.error('WARNING: cannot modify case models in pre-update hooks.');
    }
    return Task.find(this.id)
      .then(model => {
        return model.update(data, { ...this.meta });
      });
  }

  patch(data) {
    if (this.isPreCreateHook) {
      return console.error('WARNING: cannot modify case models in pre-create hooks.');
    }
    if (this.isPreUpdateHook) {
      return console.error('WARNING: cannot modify case models in pre-update hooks.');
    }
    return Task.find(this.id)
      .then(model => {
        return model.patch(data, { ...this.meta });
      });
  }

  redirect(result) {
    if (this.event !== 'pre-create') {
      throw new Error('Can only `redirect` on `pre-create` events');
    }
    if (typeof result === 'string') {
      result = { id: result };
    }
    const { id } = result;
    if (!id) {
      throw new Error('`redirect` must be called with an id or an object with an id property');
    }
    Object.defineProperty(this, 'terminated', { value: TERMINATED, configurable: false });
    Object.defineProperty(this, 'result', { value: result, configurable: false });
  }

}

module.exports = EventWrapper;
