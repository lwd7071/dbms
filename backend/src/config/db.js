/** Role-scoped SQL Server pools used by HTTP requests. */
const sql = require('mssql');
require('dotenv').config({ quiet: true });
const { assertRequiredEnvironment } = require('./env');
const { AsyncLocalStorage } = require('node:async_hooks');
const requestPoolContext = new AsyncLocalStorage();

const roleEnvironment = {
  SINH_VIEN: ['DB_STUDENT_USER', 'DB_STUDENT_PASSWORD'],
  GIANG_VIEN: ['DB_LECTURER_USER', 'DB_LECTURER_PASSWORD'],
  DAO_TAO: ['DB_TRAINING_USER', 'DB_TRAINING_PASSWORD'],
  QUAN_TRI: ['DB_ADMIN_USER', 'DB_ADMIN_PASSWORD']
};
const businessRoles = Object.keys(roleEnvironment);
const pools = new Map();
const baseConfig = () => ({
  server: process.env.DB_SERVER || 'localhost',
  port: Number.parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'DBMS330284',
  options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  pool: { min: 0, max: 5, idleTimeoutMillis: 30000 },
  connectionTimeout: 15000,
  requestTimeout: 15000
});
const expectedIdentitySql = `SELECT USER_NAME() AS databaseUser,
  IS_MEMBER('APP_RUNTIME') AS appRuntime, IS_MEMBER('APP_AUTH') AS appAuth,
  IS_MEMBER('SINH_VIEN') AS sinhVien, IS_MEMBER('GIANG_VIEN') AS giangVien,
  IS_MEMBER('DAO_TAO') AS daoTao, IS_MEMBER('QUAN_TRI') AS quanTri,
  IS_MEMBER('db_owner') AS dbOwner, IS_MEMBER('db_datareader') AS dbDataReader,
  IS_MEMBER('db_datawriter') AS dbDataWriter, IS_SRVROLEMEMBER('sysadmin') AS sysadmin`;
const roleColumns = { SINH_VIEN: 'sinhVien', GIANG_VIEN: 'giangVien', DAO_TAO: 'daoTao', QUAN_TRI: 'quanTri' };
const identityIsAllowed = (identity, kind, role, expectedUser) => {
  if (!identity || identity.databaseUser !== expectedUser || Number(identity.appRuntime) !== 1) return false;
  if ([identity.dbOwner, identity.dbDataReader, identity.dbDataWriter, identity.sysadmin].some(Number)) return false;
  const activeRoles = businessRoles.filter(name => Number(identity[roleColumns[name]]) === 1);
  if (kind === 'auth') return Number(identity.appAuth) === 1 && activeRoles.length === 0;
  if (kind !== 'role') return true;
  return activeRoles.length === 1 && activeRoles[0] === role && Number(identity.appAuth) === 0;
};
const openPool = (key, kind, role, userEnv, passwordEnv) => {
  assertRequiredEnvironment();
  if (!pools.has(key)) {
    const config = { ...baseConfig(), user: process.env[userEnv], password: process.env[passwordEnv] };
    const promise = (async () => {
      const pool = new sql.ConnectionPool(config);
      try {
        await pool.connect();
        if (kind === 'auth' || kind === 'role') {
          const result = await pool.request().query(expectedIdentitySql);
          if (!identityIsAllowed(result.recordset?.[0], kind, role, config.user)) {
            throw new Error(`SQL principal ${config.user} is not mapped to the required ${role || 'APP_AUTH'} role with least-privilege membership.`);
          }
        }
        if (typeof pool.on === 'function') pool.on('error', () => pools.delete(key));
        return pool;
      } catch (error) {
        try { await pool.close(); } catch (_) { /* best-effort cleanup */ }
        throw error;
      }
    })();
    pools.set(key, promise);
    promise.catch(() => { if (pools.get(key) === promise) pools.delete(key); });
  }
  return pools.get(key);
};
const getAuthPool = () => openPool('auth', 'auth', null, 'DB_USER', 'DB_PASSWORD');
const getRolePool = role => {
  const env = roleEnvironment[role];
  if (!env) throw new Error(`Unknown application role: ${role}`);
  return openPool(role, 'role', role, env[0], env[1]);
};
const getMaintenancePool = () => {
  if (!process.env.DB_MAINT_USER || !process.env.DB_MAINT_PASSWORD) throw new Error('Maintenance pool requires DB_MAINT_USER and DB_MAINT_PASSWORD.');
  return openPool('maintenance', 'maintenance', null, 'DB_MAINT_USER', 'DB_MAINT_PASSWORD');
};
const getFixturePool = () => {
  if (process.env.NODE_ENV !== 'test') throw new Error('Fixture SQL pool is available only in NODE_ENV=test.');
  if (!/(?:_Test|_CodexDemo)(?:_[A-Za-z0-9]+)?$/i.test(process.env.DB_NAME || '')) {
    throw new Error('Fixture pool refuses databases outside the isolated *_Test or *_CodexDemo databases.');
  }
  if (!process.env.DB_TEST_USER || !process.env.DB_TEST_PASSWORD) throw new Error('Fixture pool requires DB_TEST_USER and DB_TEST_PASSWORD.');
  return openPool('fixture', 'fixture', null, 'DB_TEST_USER', 'DB_TEST_PASSWORD');
};
const runWithRequestPool = (pool, actor, callback) => requestPoolContext.run({ pool, actor }, callback);
const getPool = () => {
  const context = requestPoolContext.getStore();
  if (context?.pool) return context.pool;
  if (process.env.NODE_ENV === 'test') return getFixturePool();
  throw new Error('Request database access requires a verified role pool from authentication middleware.');
};
const closeAllPools = async () => {
  const pending = [...pools.values()];
  pools.clear();
  const settled = await Promise.allSettled(pending);
  await Promise.allSettled(settled.filter(x => x.status === 'fulfilled').map(x => x.value.close()));
};
const getRequestActorId = () => requestPoolContext.getStore()?.actor?.maTaiKhoan || null;
module.exports = { sql, getAuthPool, getRolePool, getMaintenancePool, getFixturePool, closeAllPools, getPool, closePool: closeAllPools, runWithRequestPool, getRequestActorId, expectedIdentitySql };
