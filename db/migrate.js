'use strict';

/*
Very simple migration script that just uses a patches folder with sql scripts and stores
scripts ran in a migrations tables.

If the scripts start with a timestamp they will always be ran in order.
*/

const config = require('config');
const fs = require('fs');
const path = require('path');
const {QueryFile} = require('pg-promise');

const getDBConnection = require('../server/data/get-db-connection');
const getLogger = require('../server/lib/get-logger');
const waitDBConnect = require('../server/data/wait-db-connect');

const db = getDBConnection(config);
const logger = getLogger(config);

const patchFolder = path.join(__dirname, 'patches');

const migrationTableExistsSql = `SELECT EXISTS (
  SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'migrations'
)`;

const createMigrationTableSql = `
CREATE TABLE IF NOT EXISTS migrations (
  filename TEXT PRIMARY KEY NOT NULL, 
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
)`;

const getCurrentMigrationsSql = 'SELECT filename FROM migrations';

const insertPatchRanSql = `INSERT INTO migrations (filename) VALUES ($1)`;

/**
 * Runs the patch files not already ran in synchronously then return the results
 * @param {Object} migrateDb pdp db object for migrations
 * @param {Object} patchesToRun array of files to run to patch the db
 */
async function runPatches(migrateDb, patchesToRun) {
  for (let i = 0, len = patchesToRun.length; i < len; i++) {
    const filename = patchesToRun[i];
    logger.info(`Running ${filename}.`);
    const sql = new QueryFile(path.join(patchFolder, filename));
    await migrateDb.none(sql);
    await migrateDb.none(insertPatchRanSql, filename);
  }
}

/**
 * Runs the migrations and still needs to be a function as there is no top level await
 */
async function doMigration() {
  const migrateDb = await waitDBConnect(db, logger);
  const migrationTableExists = (await migrateDb.one(migrationTableExistsSql)).exists;
  logger.info('migrationTableExists', {migrationTableExists});
  if (!migrationTableExists) {
    await migrateDb.query(createMigrationTableSql);
  }
  const currentAppliedPatches = (await migrateDb.query(getCurrentMigrationsSql)).map(f => f.filename);
  logger.info('current patches', {currentAppliedPatches});
  logger.info(`reading patches from ${patchFolder}`);
  const patchesToRun = fs
    .readdirSync(patchFolder)
    .filter(name => name.charAt(0) !== '.' && !currentAppliedPatches.includes(name))
    .sort();
  logger.info('running patches', {patchesToRun});
  const results = await runPatches(migrateDb, patchesToRun);
  logger.info('db migration completed', {results});
  migrateDb.$pool.end();
}
doMigration();
