// THis ensure that things do not fail silently and will throw errors
"use strict";

const database = require("better-sqlite3");

const db = new database("log.db");

const stmt = db.prepare(
  `SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`
);

let row = stmt.get();

if (row === undefined) {
  console.log("Your database appears to be empty. I will intlized it now.");

  const sqlInit = `
        CREATE TABLE accesslog ( 
          id INTEGER PRIMARY KEY, 
          remoteaddr VARCHAR, 
          remoteuser VARCHAR, 
          time NUMERIC, 
          method VARCHA, 
          url VARCHAR, 
          protocol VARCHAR, 
          httpversion VARCHAR, 
          secure VARCHAR, 
          status INTEGER, 
          referer VARCHAR, 
          useragent VARCHAR );
    `;
  // Execute SQL commands that we just wrote above.
  db.exec(sqlInit);
  // Echo information about what we just did to the console.
  console.log(
    "Your database has been initialized with a new table and two entries containing a username and password."
  );
} else {
  // Since the database already exists, echo that to the console.
  console.log("Database exists.");
}
// Export all of the above as a module so that we can use it elsewhere.
module.exports = db;
