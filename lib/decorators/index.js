module.exports = {
  init: () => {

    const decorators = [];

    const decorate = (c, user) => {
      if (typeof c.toJSON === 'function') {
        c = c.toJSON();
      }
      return decorators.reduce((promise, fn) => {
        return promise.then(c => fn(c, user));
      }, Promise.resolve(c));
    };

    return {
      add: fn => {
        if (typeof fn !== 'function') {
          throw new Error(`Invalid decorator type: ${typeof fn}`);
        }
        decorators.push(fn);
      },
      apply: (c, user) => {
        if (Array.isArray(c)) {
          return Promise.all(c.map(task => decorate(task, user)));
        }
        return decorate(c, user);
      }
    };
  }
};
