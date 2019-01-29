module.exports = {
  init: () => {

    const decorators = [];

    const decorate = (c, req) => {
      if (typeof c.toJSON === 'function') {
        c = c.toJSON();
      }
      return decorators.reduce((promise, fn) => {
        return promise.then(c => fn(c, req));
      }, Promise.resolve(c));
    };

    return {
      add: fn => {
        if (typeof fn !== 'function') {
          throw new Error(`Invalid decorator type: ${typeof fn}`);
        }
        decorators.push(fn);
      },
      apply: (c, req) => {
        if (Array.isArray(c)) {
          return Promise.all(c.map(task => decorate(task, req)));
        }
        return decorate(c, req);
      }
    };
  }
};
