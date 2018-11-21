module.exports = {
  init: () => {

    const decorators = [];

    const decorate = c => decorators.reduce((promise, fn) => promise.then(obj => fn(obj)), Promise.resolve(c));

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
