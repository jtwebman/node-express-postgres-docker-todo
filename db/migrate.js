'use strict';

const fs = require('fs');
const path = require('path');
const { QueryFile } = require('pg-promise');
const { parse } = require('pg-connection-string');

const { getDB, waitDBConnect } = require('../server/db/pg-client');

const databaseExistsSql = `SELECT EXISTS (SELECT FROM pg_database WHERE datname = $1)`;

const createDatabaseSql = `CREATE DATABASE $1:name`;

const userExistsSql = `SELECT EXISTS (SELECT FROM pg_roles WHERE rolname = $1)`;

const createUserSql = `CREATE USER $1:name WITH NOCREATEDB ENCRYPTED PASSWORD $2`;
const grantUserDBAccessSql = `GRANT CONNECT, TEMP ON DATABASE $1:name TO $2:name;`;
const grantUserSchemaAccessSql = `GRANT USAGE ON SCHEMA public TO $1:name;`;
const grantUserTableAccessSql =
  'GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public TO $1:name;';
const grantUserSequenceAccessSql = `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $1:name;`;
const grantUserFunctionAccessSql = `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO $1:name;`;

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

const patchFolder = path.join(__dirname, 'patches');

async function runMigrations(config, logger) {
  logger.info('Starting DB Migrations');
  try {
    if (!config.PG_CONNECTION && !config.PG_MIGRATION_CONNECTION) {
      const missingSettings = [];
      if (!config.PG_CONNECTION) {
        missingSettings.push('PG_CONNECTION');
      }
      if (!config.PG_MIGRATION_CONNECTION) {
        missingSettings.push('PG_MIGRATION_CONNECTION');
      }
      throw new Error(`Missing config ${missingSettings.join(' and ')}.`);
    }
    const pgMigrationConfig = parse(config.PG_MIGRATION_CONNECTION);
    const pgConfig = parse(config.PG_CONNECTION);

    const migrationAdminDB = getDB(config.PG_MIGRATION_CONNECTION);

    await waitDBConnect(migrationAdminDB);

    logger.info(`Checking db ${pgConfig.database} exists.`);

    const databaseExistResults = await migrationAdminDB.one(databaseExistsSql, [pgConfig.database]);

    if (!databaseExistResults.exists) {
      logger.info(`Creating db ${pgConfig.database}.`);
      await migrationAdminDB.none(createDatabaseSql, [pgConfig.database]);
    }

    migrationAdminDB.$pool.end();

    const migrationDB = getDB({ ...pgMigrationConfig, database: pgConfig.database });
    await waitDBConnect(migrationDB);

    if (pgConfig.user && pgConfig.password) {
      logger.info(`Checking user ${pgConfig.user} exists.`);
      const userExistsResults = await migrationDB.one(userExistsSql, [pgConfig.user]);

      if (!userExistsResults.exists) {
        logger.info(`Creating user ${pgConfig.user}.`);
        await migrationDB.none(createUserSql, [pgConfig.user, pgConfig.password]);
      }
    }

    logger.info('Checking migration table exists.');
    const tableExistResults = await migrationDB.one(migrationTableExistsSql);

    if (!tableExistResults.exists) {
      logger.info('Creating migration table.');
      await migrationDB.query(createMigrationTableSql);
    }

    const currentPatchesResults = await migrationDB.manyOrNone(getCurrentMigrationsSql);
    const currentAppliedPatches = currentPatchesResults.map(f => f.filename);

    const patchesToRun = fs
      .readdirSync(patchFolder, { withFileTypes: true })
      .filter(
        dirent =>
          dirent.isFile() &&
          dirent.name.charAt(0) !== '.' &&
          dirent.name.endsWith('.sql') &&
          !currentAppliedPatches.includes(dirent.name),
      )
      .map(dirent => dirent.name)
      .sort();

    for (let i = 0, len = patchesToRun.length; i < len; i++) {
      const filename = patchesToRun[i];
      try {
        logger.info(`Running ${filename}.`);
        const sql = new QueryFile(path.join(patchFolder, filename), { noWarnings: true });
        await migrationDB.any(sql);
        await migrationDB.none(insertPatchRanSql, filename);
      } catch (error) {
        logger.error(`Error Running ${filename}: ${error.stack}`);
      }
    }

    logger.info(`Granting user ${pgConfig.user} all permissions needed in db ${pgConfig.database}.`);
    await migrationDB.none(grantUserDBAccessSql, [pgConfig.database, pgConfig.user]);
    await migrationDB.none(grantUserSchemaAccessSql, [pgConfig.user]);
    await migrationDB.none(grantUserTableAccessSql, [pgConfig.user]);
    await migrationDB.none(grantUserSequenceAccessSql, [pgConfig.user]);
    await migrationDB.none(grantUserFunctionAccessSql, [pgConfig.user]);

    /* shutdown migration connection pool */
    migrationDB.$pool.end();
  } catch (error) {
    logger.error(`Error running migrations: ${error.stack}`);
    throw error;
  }
}

module.exports = {
  patchFolder,
  runMigrations,
};
