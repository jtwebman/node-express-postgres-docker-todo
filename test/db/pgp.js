'use strict';

const config = require('config');
const sinon = require('sinon');
const assert = require('chai').assert;

const { getDB } = require('../../data/db-client');

describe('pgp Tests', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('setting SHOW_SQL=1 logs out sql queries for testing', async () => {
    try {
      process.env.SHOW_SQL = '1';
      const db = getDB(config.PG_CONNECTION);
      const spy = sandbox.spy(console, 'log');
      const query = 'SELECT id FROM users';
      await db.any(query);
      assert.equal(spy.withArgs(query).calledOnce, true);
    } finally {
      process.env.SHOW_SQL = undefined;
    }
  });
});
