const assert = require('assert');
const Taskflow = require('../../');

describe('Initialisation', () => {

  it('exports a function', () => {
    assert.equal(typeof Taskflow, 'function');
  });

  describe('instance', () => {

    beforeEach(() => {
      this.instance = Taskflow();
    });

    it('returns a middleware', () => {
      assert.equal(typeof this.instance, 'function', 'instance is a function');
      assert.equal(this.instance.length, 3, 'instance is a function of length 3');
    });

    it('has a `hook` method', () => {
      assert.equal(typeof this.instance.hook, 'function', 'taskflow.hook is a function');
    });

  });

});
