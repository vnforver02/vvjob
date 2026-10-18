'use strict';
// A separate one-connection pool avoids exhausting NodeBB's pool while callers
// wait for the cross-process lock and the holder uses native database methods.
module.exports = function (db, Pool) {
  let pool;
  return async function withLock(work) {
    if (!db.pool || !db.pool.options) { throw Error('Verification requires the supported PostgreSQL deployment.'); }
    // pg-pool deliberately makes password/ssl non-enumerable; spreading its
    // options alone silently drops credentials on authenticated deployments.
    pool ||= new Pool({ ...db.pool.options, password: db.pool.options.password, ssl: db.pool.options.ssl, max: 1, idleTimeoutMillis: 10000, connectionTimeoutMillis: 5000, allowExitOnIdle: true, application_name: 'vvjob-verification-lock' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL lock_timeout = '5s'");
      await client.query('SELECT pg_advisory_xact_lock(1836487221, 956004117)');
      const result = await work();
      await client.query('COMMIT');
      return result;
    } catch (err) { await client.query('ROLLBACK'); throw err; } finally { client.release(); }
  };
};
