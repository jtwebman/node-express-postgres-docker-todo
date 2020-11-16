'use strict';

const supertest = require('supertest');
const assert = require('chai').assert;

const getApp = require('../../../server/app');
const getTestContext = require('../../lib/get-test-context');

describe('index', () => {
  let app;

  before(async () => {
    const context = await getTestContext();
    app = getApp(context);
  });

  it('returns Hello World! when called', () =>
    supertest(app)
      .get('/')
      .expect(200)
      .then(res => {
        assert.equal(res.text, 'Hello World!');
      }));
});
