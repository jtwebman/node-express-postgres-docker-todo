'use strict';

const supertest = require('supertest');
const assert = require('chai').assert;

const { getTestApp } = require('../../app');

describe('status', () => {
  let app;

  before(async () => {
    app = await getTestApp();
  });

  it('returns OK', () =>
    supertest(app)
      .get('/status')
      .expect(200)
      .then(res => {
        assert.equal(res.text, 'OK');
      }));
});
