const assert = require('assert');
const Taskflow = require('../');

describe('Initialisation', () => {

  it('exports a function', () => {
    assert.equal(typeof Taskflow, 'function');
  });

});
