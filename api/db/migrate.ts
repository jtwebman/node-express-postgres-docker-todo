/*
Very simple migration script that just uses a patches folder with sql scripts and stores
scripts ran in a migrations tables.

If the scripts start with a timestamp they will always be ran in order.
*/

import config from 'config';
import fs from 'fs';
import path from 'path';
import { QueryFile } from 'pg-promise';

import { Database, getDB, waitDBConnect } from '../src/db';
import { getLogger } from '../src/logger';

const db = getDB(config);
const args = process.argv.slice(2);
const patchFolder = path.join(args[0]);
const logger = getLogger(config);

interface MigrationContext {
  db: Database;
  migrationTableExists?: boolean;
  currentAppliedPatches: string[];
  patchesToRun: string[];
  results?: unknown[];
}

interface MigrationFile {
  filename: string;
}

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
 * Waits for the db to be ready before running migration sql statements.
 * @return {Object} returns a new conext object with the db in it.
 */
async function makeSureDBisUp(): Promise<MigrationContext> {
  await waitDBConnect(db, logger);
  const newContext: MigrationContext = {
    db,
    currentAppliedPatches: [],
    patchesToRun: [],
  };
  return newContext;
}

/**
 * Adds to the context if the migration table exists
 * @param {Object} context object
 * @return {Object} returns the same context object passed in with the added values
 */
async function migrationTableExists(context: MigrationContext) {
  const results = await context.db.one(migrationTableExistsSql);
  context.migrationTableExists = results.exists;
  return context;
}

/**
 * Checks if the migratio ntable exists. If it doesn't it creates it.
 * @param {Object} context object
 * @return {Object} returns the same context object passed in
 */
async function createMigrationTableIfNeeded(context: MigrationContext) {
  if (context.migrationTableExists) return context;
  await context.db.query(createMigrationTableSql);
  return context;
}

/**
 * Gets the list of the current patches applied adding it to the context
 * @param {Object} context object
 * @return {Object} returns the same context object passed in with the added values
 */
async function getCurrentAppliedPatches(context: MigrationContext) {
  const results = await context.db.query<[MigrationFile]>(getCurrentMigrationsSql);
  context.currentAppliedPatches = results.map((f) => f.filename);
  return context;
}

/**
 * Gets the list of patches in the folder and filters out the ones already ran
 * @param {Object} context object
 * @return {Object} returns the same context object passed in with the added values
 */
function getPatchesToRun(context: MigrationContext) {
  context.patchesToRun = fs
    .readdirSync(patchFolder)
    .filter((name) => name.charAt(0) !== '.' && !context.currentAppliedPatches.includes(name))
    .sort();
  return context;
}

/**
 * Runs the patch files not already ran in synchronously adding to the context the results
 * @param {Object} context object
 * @Return {Object} returns the same context object passed in with the added values
 */
async function runPatches(context: MigrationContext) {
  context.results = [];
  for (let i = 0, len = context.patchesToRun.length; i < len; i++) {
    const filename = context.patchesToRun[i];
    try {
      logger.info(`Running ${filename}.`);
      const sql = new QueryFile(path.join(patchFolder, filename));
      const results = await context.db.none(sql);
      await context.db.none(insertPatchRanSql, filename);
      context.results.push(results);
    } catch (error) {
      logger.error(`Error Running ${filename}: ${error.stack}`);
    }
  }
  return context;
}

makeSureDBisUp()
  .then(migrationTableExists)
  .then(createMigrationTableIfNeeded)
  .then(getCurrentAppliedPatches)
  .then(getPatchesToRun)
  .then(runPatches)
  .then((context) => context.db.$pool.end());
