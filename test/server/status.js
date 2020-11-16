'use strict';

const supertest = require('supertest');
const assert = require('chai').assert;

const getApp = require('../../server/status');
const getTestContext = require('../lib/get-test-context');

describe('private status check', () => {
  let app;

  before(async () => {
    const context = await getTestContext();
    app = getApp(context);
  });

  it('returns OK', () =>
    supertest(app)
      .get('/status')
      .expect(200)
      .then(res => {
        assert.equal(res.text, 'OK');
      }));
});
