const assert = require('assert');

const Store = require('../../../lib/hooks/store');

describe('Hooks Store', () => {

  beforeEach(() => {
    this.store = Store.init();
  });

  describe('create', () => {

    it('throws if not passed a non-string event function', () => {
      assert.throws(() => {
        this.store.create(100, () => {});
      });
    });

    it('throws if passed an invalid event name', () => {
      assert.throws(() => this.store.create('000'), 'Cannot start with numeric characters');
      assert.throws(() => this.store.create(':asdf:asdf'), 'Cannot start with colon');
      assert.throws(() => this.store.create(':asdf:asdf'), 'Cannot start with colon');
      assert.throws(() => this.store.create('status:**:asdf'), 'Cannot contain double asterisks');
      assert.throws(() => this.store.create('*'), 'Cannot only be an asterisk');
    });

    it('throws if not passed a handler function', () => {
      assert.throws(() => {
        this.store.create('create');
      });
    });

    it('can be chained', () => {
      this.store.create('create', () => {}).create('create', () => {});
      assert.equal(this.store.hooks('create').length, 2, '2 hooks have been added');
    });

  });

  describe('hooks', () => {

    it('returns empty array by default', () => {
      assert.deepEqual(this.store.hooks(), []);
    });

    it('returns hooks which are an exact match for the event', () => {
      this.store.create('create', () => {});
      this.store.create('status:old:new', () => {});
      const createHooks = this.store.hooks('create');
      assert.equal(createHooks.length, 1, 'returns 1 hook');
      assert.equal(createHooks[0].event, 'create', 'returns the `create` hook');

      const statusHooks = this.store.hooks('status:old:new');
      assert.equal(statusHooks.length, 1, 'returns 1 hook');
      assert.equal(statusHooks[0].event, 'status:old:new', 'returns the `status:old:new` hook');
    });

    it('returns hooks which are a wildcard match for the event', () => {
      this.store.create('status:*:new', () => {});
      this.store.create('status:old:new', () => {});
      this.store.create('status:old:*', () => {});
      const hooks = this.store.hooks('status:old:new');
      assert.equal(hooks.length, 3, 'returns 3 hooks');
    });

    it('does not return non-wildcard hooks which are a partial match for the event', () => {
      this.store.create('status:*:new', () => {});
      this.store.create('status:old:new', () => {});
      const hooks = this.store.hooks('status:other:new');
      assert.equal(hooks.length, 1, 'returns 1 hook');
      assert.equal(hooks[0].event, 'status:*:new', 'returns the `status:*:new` hook');
    });

    it('does not return non-wildcard hooks which are more specific than the event', () => {
      this.store.create('status:*:new', () => {});
      this.store.create('status:old:new', () => {});
      const hooks = this.store.hooks('status:old');
      assert.equal(hooks.length, 0, 'returns 0 hooks');
    });

  });

});
