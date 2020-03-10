const { get } = require('lodash');
const Task = require('../models/task');

class EventWrapper {

  constructor({ id, meta = {}, event, transaction }) {
    this.id = id;
    this.meta = meta;
    this.event = event;
    this.comment = meta.comment || get(meta, 'payload.meta.comment');

    Object.defineProperty(this, 'isPreStatusHook', { value: !!event.match(/^pre-status/) });
    Object.defineProperty(this, 'isPreUpdateHook', { value: !!event.match(/^pre-update/) });
    Object.defineProperty(this, 'isPreCreateHook', { value: !!event.match(/^pre-create/) });
    Object.defineProperty(this, 'transaction', { value: transaction });
  }

  populate() {
    if (this.event === 'pre-create') {
      return Promise.resolve();
    }
    return Task.find(this.id, this.transaction)
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
    return Task.find(this.id, this.transaction)
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
    return Task.find(this.id, this.transaction)
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
    return Task.find(this.id, this.transaction)
      .then(model => {
        return model.patch(data, { ...this.meta });
      });
  }

  find(id) {
    return Task.find(id, this.transaction);
  }

}

module.exports = EventWrapper;
