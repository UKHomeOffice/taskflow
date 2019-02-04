module.exports = {
  init: () => {

    const decorators = [];

    const decorate = (c, user, params = {}) => {
      if (typeof c.toJSON === 'function') {
        c = c.toJSON();
      }
      return decorators.reduce((promise, decorator) => {
        if (params.isList && decorator.params.list === false) {
          return promise;
        }
        return promise.then(c => decorator.fn(c, user));
      }, Promise.resolve(c));
    };

    return {
      add: (fn, params = {}) => {
        if (typeof fn !== 'function') {
          throw new Error(`Invalid decorator type: ${typeof fn}`);
        }
        decorators.push({ fn, params });
      },
      apply: (c, user) => {
        if (Array.isArray(c)) {
          return Promise.all(c.map(task => decorate(task, user, { isList: true })));
        }
        return decorate(c, user);
      }
    };
  }
};
