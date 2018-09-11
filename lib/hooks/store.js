const { every } = require('lodash');
const EventWrapper = require('./event-wrapper');

class Store {

  static init() {
    return new Store();
  }

  constructor() {
    this._hooks = [];
  }

  validate(event, fn) {
    if (typeof event !== 'string') {
      throw new Error('Event name passed to `hook` must be a string');
    }
    if (typeof fn !== 'function') {
      throw new Error('Handler passed to `hook` must be a function');
    }
    const parts = event.split(':');
    if (!every(parts, p => p.match(/^([*]{1})|([a-z]+[a-z-]*)$/i))) {
      throw new Error('Invalid hook event. Events must contain only letters and hyphens, and must start with a letter.');
    }
  }

  create(event, fn) {
    this.validate(event, fn);
    const re = event.split(':').map(p => p === '*' ? '[^:]+' : p).join(':');
    this._hooks.push({
      event,
      re: new RegExp(`^${re}$`),
      fn
    });
  }

  hooks(event) {
    return this._hooks.filter(hook => hook.re.test(event));
  }

  invoke({ event, id, meta, handler }) {
    const model = new EventWrapper({ event, id, meta });
    const before = this.hooks(`pre-${event}`);
    const after = this.hooks(event);
    return Promise.resolve()
      .then(() => {
        return before.reduce((p, hook) => {
          return p.then(() => {
            return hook.fn(model);
          });
        }, Promise.resolve());
      })
      .then(() => handler())
      .then(() => {
        return after.reduce((p, hook) => {
          return p.then(() => {
            return hook.fn(model);
          });
        }, Promise.resolve());
      });
  }

}

module.exports = Store;
