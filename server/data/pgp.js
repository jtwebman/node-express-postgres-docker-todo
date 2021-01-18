'use strict';

const pgp = require('pg-promise')({
  capSQL: true,
});

// Override timestamp no timezone to correct Date object
pgp.pg.types.setTypeParser(1114, stringValue => new Date(`${stringValue}+0000`));

// Override bigint (type 20): Convert from string to integer *warning could lose values on really big numbers*
pgp.pg.types.setTypeParser(20, stringValue => parseInt(stringValue, 10));

module.exports = pgp;
