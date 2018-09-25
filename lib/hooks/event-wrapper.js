const Case = require('../models/case');

class EventWrapper {

  constructor({ id, meta, event, hooks }) {
    this.id = id;
    this.meta = meta;
    this.event = event;
    Object.defineProperty(this, 'hooks', { value: hooks });
    Object.defineProperty(this, 'isPreHook', { value: !!event.match(/^pre-/) });
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
    if (this.isPreHook) {
      return console.error('WARNING: cannot modify case models in pre-event hooks.');
    }
    return Case.find(this.id)
      .then(model => {
        return model.status(status, { ...this.meta, hooks: this.hooks });
      });
  }

  update(data) {
    if (this.isPreHook) {
      return console.error('WARNING: cannot modify case models in pre-event hooks.');
    }
    return Case.find(this.id)
      .then(model => {
        return model.update(data, { ...this.meta, hooks: this.hooks });
      });
  }

}

module.exports = EventWrapper;
