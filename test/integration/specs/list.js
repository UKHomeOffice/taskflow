const request = require('supertest');
const express = require('express');
const assert = require('assert');

const Taskflow = require('../../../');
const Task = require('../../../lib/db/task');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;

describe('GET /', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();
    this.app.use(this.flow);

    return reset()
      .then(() => {
        return Promise.all([
          Task.query(this.flow.db)
            .insert([
              {
                id: 'fb38e7be-386b-4681-9717-af9a7396b8ed',
                status: 'resolved',
                data: {
                  model: 'establishment',
                  subject: '5b7bad13-f34b-4959-bd08-c6067ae2fcdd'
                }
              },
              {
                id: '0ddfea8d-31d9-4258-a545-b403a3fc4864',
                status: 'autoresolved',
                data: {
                  model: 'pil',
                  subject: '5b7bad13-f34b-4959-bd08-c6067ae2fcdd',
                  action: 'create'
                }
              },
              {
                id: 'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
                status: 'with-ntco',
                data: {
                  model: 'pil',
                  subject: '5b7bad13-f34b-4959-bd08-c6067ae2fcdd'
                }
              },
              {
                id: 'a5aa8804-4658-458d-87b4-88a585c70cea',
                status: 'with-licensing',
                data: {
                  model: 'project',
                  subject: '5b7bad13-f34b-4959-bd08-c6067ae2fcdd'
                }
              },
              {
                id: '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b',
                status: 'with-licensing',
                data: {
                  model: 'pil',
                  subject: '87f55c90-2ca6-4661-bf5e-3dd78aedded0'
                }
              }
            ])
        ]);
      });
  });

  afterEach(done => {
    this.flow.db.destroy(done);
  });

  it('responds 200', () => {
    return request(this.app)
      .get('/')
      .expect(200);
  });

  it('can return all the things', () => {
    return request(this.app)
      .get('/')
      .expect(response => {
        assert.equal(response.body.data.length, 5, '5 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          '0ddfea8d-31d9-4258-a545-b403a3fc4864',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ]);
      });
  });

  it('can exclude tasks by status', () => {
    return request(this.app)
      .get('/?exclude[status]=autoresolved')
      .expect(response => {
        assert.equal(response.body.data.length, 4, '4 records were returned');

        const actualIds = response.body.data.map(o => o.id).sort();

        const expectedIds = [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ].sort();

        assert.deepEqual(actualIds, expectedIds);
      });
  });

  it('can exclude tasks by multiple statuses', () => {
    return request(this.app)
      .get('/?exclude[status]=autoresolved&exclude[status]=resolved')
      .expect(response => {
        assert.equal(response.body.data.length, 3, '3 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id).sort(), [
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ].sort());
      });
  });

  it('can fetch tasks by status', () => {
    return request(this.app)
      .get('/?status=with-ntco')
      .expect(response => {
        assert.equal(response.body.data.length, 1, '1 record was returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da'
        ]);
      });
  });

  it('can fetch tasks by multiple statuses', () => {
    return request(this.app)
      .get('/?status=with-ntco&status=resolved')
      .expect(response => {
        assert.equal(response.body.data.length, 2, '2 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id).sort(), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da'
        ].sort());
      });
  });

  it('can fetch the tasks by any data property', () => {
    return request(this.app)
      .get('/?data[subject]=5b7bad13-f34b-4959-bd08-c6067ae2fcdd')
      .expect(response => {
        assert.equal(response.body.data.length, 4, '4 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id).sort(), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          '0ddfea8d-31d9-4258-a545-b403a3fc4864',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea'
        ].sort());
      });
  });

  it('can fetch the tasks by multiple data properties', () => {
    return request(this.app)
      .get('/?data[subject]=5b7bad13-f34b-4959-bd08-c6067ae2fcdd&data[model]=establishment')
      .expect(response => {
        assert.equal(response.body.data.length, 1, '1 record was returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed'
        ]);
      });
  });

  it('can fetch the tasks by a data property and exclude a status', () => {
    return request(this.app)
      .get('/?data[model]=pil&exclude[status]=autoresolved')
      .expect(response => {
        assert.equal(response.body.data.length, 2, '2 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id).sort(), [
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ].sort());
      });
  });

  it('applies a single decorator to tasks', () => {
    this.flow.decorate(task => ({ ...task, decorated: true }));
    return request(this.app)
      .get('/')
      .expect(200)
      .expect(response => {
        response.body.data.forEach(c => {
          assert.equal(c.decorated, true, 'Decorator has been applied to each case');
        });
      });
  });

  it('applies multiple decorators to tasks', () => {
    this.flow.decorate(task => ({ ...task, decorated: true }));
    this.flow.decorate(task => ({ ...task, decoratedAgain: true }));
    return request(this.app)
      .get('/')
      .expect(200)
      .expect(response => {
        response.body.data.forEach(c => {
          assert.equal(c.decorated, true, 'First decorator has been applied to each case');
          assert.equal(c.decoratedAgain, true, 'Second decorator has been applied to each case');
        });
      });
  });

  it('applies multiple async decorators to tasks in series', () => {
    this.flow.decorate(task => ({ ...task, substr: task.id.substring(0, 10) }));
    this.flow.decorate(task => ({ ...task, upper: task.substr.toUpperCase() }));
    return request(this.app)
      .get('/')
      .expect(200)
      .expect(response => {
        assert.deepEqual(response.body.data.map(o => o.upper), [
          'FB38E7BE-3',
          '0DDFEA8D-3',
          'E384F4FC-B',
          'A5AA8804-4',
          '1DA5D32E-4'
        ]);
      });
  });

  it('ignores decorators defined with `list: false`', () => {
    this.flow.decorate(task => ({ ...task, decorated: true }));
    this.flow.decorate(task => ({ ...task, decoratedAgain: true }));
    this.flow.decorate(task => ({ ...task, decoratedList: true }), { list: false });
    return request(this.app)
      .get('/')
      .expect(200)
      .expect(response => {
        response.body.data.forEach(c => {
          assert.equal(c.decorated, true, 'First decorator has been applied to each case');
          assert.equal(c.decoratedAgain, true, 'Second decorator has been applied to each case');
          assert.equal(c.decoratedList, undefined, 'List decorator has not been applied');
        });
      });
  });

});
