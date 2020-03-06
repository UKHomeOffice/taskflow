const { every } = require('lodash');
const EventWrapper = require('./event-wrapper');
const { TERMINATED } = require('../constants');

class Termination extends Error {
  constructor(result) {
    super('terminated');
    this.result = result;
  }
}

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
    return this;
  }

  hooks(event) {
    return this._hooks.filter(hook => hook.re.test(event));
  }

  invoke({ event, id, meta, handler, transaction }) {
    const before = this.hooks(`pre-${event}`);
    const after = this.hooks(event);

    const chain = (hooks, e) => {
      const model = new EventWrapper({ event: e, id, meta, hooks: this, transaction });
      return hooks.reduce((promise, hook) => {
        return promise
          .then(() => model.populate())
          .then(() => hook.fn(model))
          .then(() => {
            if (model.terminated === TERMINATED) {
              throw new Termination(model.result);
            }
          });
      }, Promise.resolve());
    };

    return Promise.resolve()
      // trigger pre-event hooks in series
      .then(() => chain(before, `pre-${event}`))
      // call event handler
      .then(() => handler())
      // trigger post-event hooks in series
      .then(result => chain(after, event).then(() => result))
      .catch(err => {
        if (err instanceof Termination) {
          return err.result;
        }
        throw err;
      });
  }

}

module.exports = Store;
