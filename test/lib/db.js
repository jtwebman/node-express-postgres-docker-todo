'use strict';

const cleanTableQueries = ['DELETE FROM access_tokens', 'DELETE FROM users'];
const queryCount = cleanTableQueries.length;

async function cleanData(db) {
  for (let i = 0; i < queryCount; i++) {
    const query = cleanTableQueries[i];
    try {
      await db.query(query);
    } catch (error) {
      throw new Error(`Failed to run query ${query}: ${error.stack}`);
    }
  }
}

module.exports = {
  cleanData,
};
