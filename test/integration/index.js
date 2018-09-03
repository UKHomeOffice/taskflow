const request = require('supertest');
const express = require('express');

const Taskflow = require('../../');

describe('Integration', () => {

  beforeEach(() => {
    this.app = express();
    this.app.use(Taskflow());
  });

  describe('GET /', () => {
    it('responds 200', () => {
      return request(this.app)
        .get('/')
        .expect(200);
    });
  });

  describe('POST /', () => {
    it('responds 200', () => {
      return request(this.app)
        .post('/')
        .expect(200);
    });
  });

});
