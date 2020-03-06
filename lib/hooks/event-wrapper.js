const { get } = require('lodash');
const Case = require('../models/case');

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
    return Case.find(this.id)
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
    return Case.find(this.id)
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
    return Case.find(this.id)
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
    return Case.find(this.id)
      .then(model => {
        return model.patch(data, { ...this.meta });
      });
  }

}

module.exports = EventWrapper;
