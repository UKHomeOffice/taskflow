module.exports = {
  init: () => {

    const decorators = [];

    const decorate = (c, profile) => {
      if (typeof c.toJSON === 'function') {
        c = c.toJSON();
      }
      return decorators.reduce((promise, fn) => {
        return promise.then(c => fn(c, profile));
      }, Promise.resolve(c));
    };

    return {
      add: fn => {
        if (typeof fn !== 'function') {
          throw new Error(`Invalid decorator type: ${typeof fn}`);
        }
        decorators.push(fn);
      },
      apply: (c, profile) => {
        if (Array.isArray(c)) {
          return Promise.all(c.map(task => decorate(task, profile)));
        }
        return decorate(c, profile);
      }
    };
  }
};
