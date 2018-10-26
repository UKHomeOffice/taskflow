const request = require('supertest');
const express = require('express');
const assert = require('assert');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');

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
          Case.query(this.flow.db)
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

  it('can exclude cases by status', () => {
    return request(this.app)
      .get('/?exclude[status]=autoresolved')
      .expect(response => {
        assert.equal(response.body.data.length, 4, '4 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ]);
      });
  });

  it('can exclude cases by multiple statuses', () => {
    return request(this.app)
      .get('/?exclude[status]=autoresolved&exclude[status]=resolved')
      .expect(response => {
        assert.equal(response.body.data.length, 3, '3 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ]);
      });
  });

  it('can fetch cases by status', () => {
    return request(this.app)
      .get('/?status=with-ntco')
      .expect(response => {
        assert.equal(response.body.data.length, 1, '1 record was returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da'
        ]);
      });
  });

  it('can fetch cases by multiple statuses', () => {
    return request(this.app)
      .get('/?status=with-ntco&status=resolved')
      .expect(response => {
        assert.equal(response.body.data.length, 2, '2 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da'
        ]);
      });
  });

  it('can fetch the cases by any data property', () => {
    return request(this.app)
      .get('/?data[subject]=5b7bad13-f34b-4959-bd08-c6067ae2fcdd')
      .expect(response => {
        assert.equal(response.body.data.length, 4, '4 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed',
          '0ddfea8d-31d9-4258-a545-b403a3fc4864',
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          'a5aa8804-4658-458d-87b4-88a585c70cea'
        ]);
      });
  });

  it('can fetch the cases by multiple data properties', () => {
    return request(this.app)
      .get('/?data[subject]=5b7bad13-f34b-4959-bd08-c6067ae2fcdd&data[model]=establishment')
      .expect(response => {
        assert.equal(response.body.data.length, 1, '1 record was returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'fb38e7be-386b-4681-9717-af9a7396b8ed'
        ]);
      });
  });

  it('can fetch the cases by a data property and exclude a status', () => {
    return request(this.app)
      .get('/?data[model]=pil&exclude[status]=autoresolved')
      .expect(response => {
        assert.equal(response.body.data.length, 2, '2 records were returned');
        assert.deepEqual(response.body.data.map(o => o.id), [
          'e384f4fc-b647-40b6-b8f6-dddc6d9e93da',
          '1da5d32e-4ec8-4ebc-8f95-6b7983077e9b'
        ]);
      });
  });
});
