import { getConfig } from '../../src/config';
import { Context, getContext } from '../../src/context';
import { getDB } from '../../src/db';
import { getLogger } from '../../src/logger';

const config = getConfig();
const db = getDB(config);
const logger = getLogger(config);

let context: Context;

/**
 * Gets the test app context
 * @return {Promise<{config: object, db: object}>} a promise resolving to the context
 */
export async function getTestContext(): Promise<Context> {
  if (!context) {
    context = await getContext(config, logger, db);
  }
  return context;
}

before(async () => {
  context = await getTestContext();
});

after(async () => {
  if (context) {
    await context.db.$pool.end();
  }
});
