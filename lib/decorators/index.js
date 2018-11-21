module.exports = {
  init: () => {

    const decorators = [];

    const decorate = c => {
      return decorators.reduce((promise, fn) => {
        return promise.then(c => fn(c));
      }, Promise.resolve(c));
    };

    return {
      add: fn => {
        if (typeof fn !== 'function') {
          throw new Error(`Invalid decorator type: ${typeof fn}`);
        }
        decorators.push(fn);
      },
      apply: c => {
        if (Array.isArray(c)) {
          return Promise.all(c.map(decorate));
        }
        return decorate(c);
      }
    };
  }
};
