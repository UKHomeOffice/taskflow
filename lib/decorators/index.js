module.exports = {
  init: () => {

    const decorators = [];

    const decorate = (task, user, params = {}) => {
      if (typeof task.toJSON === 'function') {
        task = task.toJSON();
      }
      return decorators.reduce((promise, decorator) => {
        if (params.isList && decorator.params.list === false) {
          return promise;
        }
        return promise.then(task => decorator.fn(task, user));
      }, Promise.resolve(task));
    };

    return {
      add: (fn, params = {}) => {
        if (typeof fn !== 'function') {
          throw new Error(`Invalid decorator type: ${typeof fn}`);
        }
        decorators.push({ fn, params });
      },
      apply: (task, user) => {
        if (Array.isArray(task)) {
          return Promise.all(task.map(task => decorate(task, user, { isList: true })));
        }
        return decorate(task, user);
      }
    };
  }
};
