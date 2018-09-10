const Model = require('./model');

class Store {

  constructor() {
    this._hooks = [];
  }

  create(event, fn) {
    this._hooks.push({
      event,
      fn
    });
  }

  hooks(event) {
    return this._hooks.filter(hook => {
      if (hook.event === '*' || hook.event === event) {
        return true;
      }
    }).map(hook => hook.fn);
  }

  invoke(event, data) {
    const model = new Model({ event, data });
    const hooks = this.hooks(event);
    return hooks.reduce((p, fn) => {
      return p.then(() => {
        return fn(model);
      });
    }, Promise.resolve());
  }

}

module.exports = new Store();
