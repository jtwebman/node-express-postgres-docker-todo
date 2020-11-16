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

const db = getDBConnection(config);
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
 * Adds to the context if the migration table exists
 * @param {Object} context object
 * @return {Object} returns the same context object passed in with the added values
 */
async function migrationTableExists(context) {
  const results = await context.db.one(migrationTableExistsSql);
  context.migrationTableExists = results.exists;
  return context;
}

/**
 * Checks if the migratio ntable exists. If it doesn't it creates it.
 * @param {Object} context object
 * @return {Object} returns the same context object passed in
 */
async function createMigrationTableIfNeeded(context) {
  if (context.migrationTableExists) return context;
  await context.db.query(createMigrationTableSql);
  return context;
}

/**
 * Gets the list of the current patches applied adding it to the context
 * @param {Object} context object
 * @return {Object} returns the same context object passed in with the added values
 */
async function getCurrentAppliedPatches(context) {
  const results = await context.db.query(getCurrentMigrationsSql);
  context.currentAppliedPatches = results.map(f => f.filename);
  return context;
}

/**
 * Gets the list of patches in the folder and filters out the ones already ran
 * @param {Object} context object
 * @return {Object} returns the same context object passed in with the added values
 */
function getPatchesToRun(context) {
  context.patchesToRun = fs
    .readdirSync(patchFolder)
    .filter(name => name.charAt(0) !== '.' && !context.currentAppliedPatches.includes(name))
    .sort();
  return context;
}

/**
 * Runs the patch files not already ran in synchronously adding to the context the results
 * @param {Object} context object
 * @Return {Object} returns the same context object passed in with the added values
 */
async function runPatches(context) {
  context.results = [];
  for (let i = 0, len = context.patchesToRun.length; i < len; i++) {
    const filename = context.patchesToRun[i];
    console.log(`Running ${filename}.`);
    const sql = new QueryFile(path.join(patchFolder, filename));
    const results = await context.db.none(sql);
    await context.db.none(insertPatchRanSql, filename);
    context.results.push(results);
  }
  return context;
}

migrationTableExists({db})
  .then(createMigrationTableIfNeeded)
  .then(getCurrentAppliedPatches)
  .then(getPatchesToRun)
  .then(runPatches)
  .then(context => context.db.$pool.end());
