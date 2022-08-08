'use strict';

const fs = require('fs');
const config = require('config');
const assert = require('chai').assert;
const { parse } = require('pg-connection-string');

const { getFakeLogger, messageExists } = require('../lib/logger');
const { getDB } = require('../../server/db/pg-client');
const { runMigrations, patchFolder } = require('../../db/migrate');

async function cleanUpDatabase(config) {
  const pgConfig = parse(config.PG_CONNECTION);
  const db = getDB(config.PG_MIGRATION_CONNECTION);
  await db.none('DROP DATABASE IF EXISTS $1:name;', [pgConfig.database]);
  if (pgConfig.user) {
    await db.none('DROP USER IF EXISTS $1:name;', [pgConfig.user]);
  }
  return;
}

async function testDatabase(config) {
  // Test migration ran
  const integrationDB = getDB(config.PG_CONNECTION);
  const migrationsRan = await integrationDB.manyOrNone('SELECT filename FROM migrations ORDER BY filename;');
  assert.isAbove(migrationsRan.length, 0);
  assert.equal(migrationsRan[0].filename, '20220515T191500-setup-new-db.sql');

  // Test can select with normal user from users table
  await integrationDB.manyOrNone('SELECT * FROM users;');

  await integrationDB.$pool.end();
}

describe('Postgres Migration Tests', () => {
  it('throw error if missing either connection strings', async () => {
    const logger = getFakeLogger();
    const testConfig = {};
    try {
      await runMigrations(testConfig, logger);
      assert(flase, true, 'runMigrations should have errored');
    } catch (error) {
      assert.equal(error.message, 'Missing config PG_CONNECTION and PG_MIGRATION_CONNECTION.');
    }
  });

  it('throw error if missing config PG_MIGRATION_CONNECTIONs', async () => {
    const logger = getFakeLogger();
    const testConfig = {
      PG_CONNECTION: 'postgres://new-integration-user:password123!@0.0.0.0:15432/integration-test',
    };
    try {
      await runMigrations(testConfig, logger);
      assert(flase, true, 'runMigrations should have errored');
    } catch (error) {
      assert.equal(error.message, 'Missing config PG_MIGRATION_CONNECTION.');
    }
  });

  it('throw error if missing config PG_CONNECTION', async () => {
    const logger = getFakeLogger();
    const testConfig = {
      PG_MIGRATION_CONNECTION: config.PG_MIGRATION_CONNECTION,
    };
    try {
      await runMigrations(testConfig, logger);
      assert(flase, true, 'runMigrations should have errored');
    } catch (error) {
      assert.equal(error.message, 'Missing config PG_CONNECTION.');
    }
  });

  it('can run migration creating new database and user', async () => {
    const logger = getFakeLogger();
    const testConfig = {
      PG_MIGRATION_CONNECTION: config.PG_MIGRATION_CONNECTION,
      PG_CONNECTION: 'postgres://new-integration-user:password123!@0.0.0.0:15432/integration-test',
    };
    try {
      await runMigrations(testConfig, logger);
      await testDatabase(testConfig);

      assert.equal(messageExists(logger, 'Creating db integration-test.'), true, 'logged creating db');
      assert.equal(messageExists(logger, 'Creating user new-integration-user.'), true, 'logged creating user');
    } finally {
      await cleanUpDatabase(testConfig);
    }
  });

  it('can run with database existing', async () => {
    const logger = getFakeLogger();
    const testConfig = {
      PG_MIGRATION_CONNECTION: config.PG_MIGRATION_CONNECTION,
      PG_CONNECTION: 'postgres://new-integration-user:password123!@0.0.0.0:15432/integration-test',
    };
    try {
      // Create DB ahead of time
      const integrationDB = getDB(testConfig.PG_MIGRATION_CONNECTION);
      await integrationDB.none('CREATE DATABASE $1:name', ['integration-test']);
      await integrationDB.$pool.end();

      await runMigrations(testConfig, logger);
      await testDatabase(testConfig);

      assert.equal(messageExists(logger, 'Creating db integration-test.'), false, 'should not have logged creating db');
    } finally {
      await cleanUpDatabase(testConfig);
    }
  });

  it('can run with user existing', async () => {
    const logger = getFakeLogger();
    const testConfig = {
      PG_MIGRATION_CONNECTION: config.PG_MIGRATION_CONNECTION,
      PG_CONNECTION: 'postgres://new-integration-user:password123!@0.0.0.0:15432/integration-test',
    };
    try {
      // Create user ahead of time
      const integrationDB = getDB(testConfig.PG_MIGRATION_CONNECTION);
      await integrationDB.none('CREATE USER $1:name WITH ENCRYPTED PASSWORD $2', [
        'new-integration-user',
        'password123!',
      ]);
      await integrationDB.$pool.end();

      await runMigrations(testConfig, logger);
      await testDatabase(testConfig);

      assert.equal(
        messageExists(logger, 'Creating user new-integration-user.'),
        false,
        'should not hvae logged creating user',
      );
    } finally {
      await cleanUpDatabase(testConfig);
    }
  });

  it('can run twice and the second time does not create or migrate anything', async () => {
    const logger = getFakeLogger();
    const secondLogger = getFakeLogger();
    const testConfig = {
      PG_MIGRATION_CONNECTION: config.PG_MIGRATION_CONNECTION,
      PG_CONNECTION: 'postgres://new-integration-user:password123!@0.0.0.0:15432/integration-test',
    };
    try {
      await runMigrations(testConfig, logger);
      await runMigrations(testConfig, secondLogger);
      await testDatabase(testConfig);

      assert.equal(
        messageExists(secondLogger, 'Creating db integration-test.'),
        false,
        'should not have logged creating db',
      );
      assert.equal(
        messageExists(secondLogger, 'Creating user new-integration-user.'),
        false,
        'should not have logged creating user',
      );
      assert.equal(
        messageExists(secondLogger, 'Creating migration table.'),
        false,
        'should not have logged creating migration table',
      );

      const integrationDB = getDB(testConfig.PG_CONNECTION);
      const currentPatchesResults = await integrationDB.manyOrNone('SELECT filename FROM migrations ORDER BY filename');
      await integrationDB.$pool.end();
      const currentPatches = currentPatchesResults.map(r => r.filename);
      const patchFiles = fs
        .readdirSync(patchFolder, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.charAt(0) !== '.' && dirent.name.endsWith('.sql'))
        .map(dirent => dirent.name)
        .sort();
      assert.equal(currentPatches.length, patchFiles.length, 'number of patches match folder vs db');
      assert.deepEqual(currentPatches, patchFiles);
    } finally {
      await cleanUpDatabase(testConfig);
    }
  });
});
