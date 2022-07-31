'use strict';

const supertest = require('supertest');
const assert = require('chai').assert;

const { getTestApp } = require('../../app');

describe('index', () => {
  let app;

  before(async () => {
    app = await getTestApp();
  });

  it('returns Hello World! when called', () =>
    supertest(app)
      .get('/')
      .expect(200)
      .then(res => {
        assert.equal(res.text, 'Hello World!');
      }));
});
