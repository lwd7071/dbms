const path = require('path');
const fs = require('fs');
const sql = require('mssql');
const dotenv = require('dotenv');
const rootDir = path.resolve(__dirname, '../../');
const dbDir = path.join(rootDir, 'DB');
dotenv.config({ path: path.join(rootDir, 'backend/.env'), quiet: true });
const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const action = option('--action');
const databaseName = option('--database');
const demoDatabase = /^DBMS330284_CodexDemo(?:_[A-Za-z0-9]+)?$/.test(databaseName || '');
const migrationDatabase = ['DBMS330284', 'DBMS330284_MigrationRehearsal', 'DBMS330284_MigrationRehearsal2'].includes(databaseName);
const backupVerified = option('--backup-verified') === 'YES';
if ((action === 'migrate' && databaseName === 'DBMS330284' && !backupVerified)
  || !['build', 'seed', 'verify', 'security', 'test', 'migrate'].includes(action)
  || (action === 'migrate' ? !migrationDatabase : !(demoDatabase || (migrationDatabase && ['verify', 'security', 'test'].includes(action))))) {
  console.error('Usage: node backend/scripts/run_all_db_files.js --action build|seed|verify|security|test --database DBMS330284_CodexDemo');
  console.error('Production migration requires --backup-verified YES after a verified backup and restore rehearsal. No database is dropped.');
  process.exit(2);
}
const config = database => ({
  server: process.env.DB_SERVER || 'localhost',
  port: Number.parseInt(process.env.DB_PORT, 10) || 1433,
  database,
  user: process.env.DB_MAINT_USER,
  password: process.env.DB_MAINT_PASSWORD,
  options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  pool: { min: 1, max: 1, idleTimeoutMillis: 30000 },
  connectionTimeout: 15000,
  requestTimeout: 120000
});
const createPool = async database => {
  if (!process.env.DB_MAINT_USER || !process.env.DB_MAINT_PASSWORD) throw new Error('Khai báo DB_MAINT_USER và DB_MAINT_PASSWORD cho thao tác bảo trì.');
  const pool = new sql.ConnectionPool(config(database));
  await pool.connect();
  return pool;
};
const splitBatches = text => text.split(/^\s*GO(?:\s+\d+)?\s*$/gim).map(batch => batch.trim()).filter(Boolean);
const runFile = async (pool, file) => {
  const filePath = path.join(dbDir, file);
  if (!fs.existsSync(filePath)) throw new Error(`SQL file not found: ${filePath}`);
  console.log(`▶ ${file}`);
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/\$\(DatabaseName\)/g, databaseName)
    .replace(/\[DBMS330284\]/g, `[${databaseName}]`);
  for (const batch of splitBatches(source)) await pool.request().batch(batch);
};
const runAppProcedures = async pool => {
  const filePath = path.join(dbDir, '08_StoredProcedures.sql');
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/\$\(DatabaseName\)/g, databaseName)
    .replace(/\[DBMS330284\]/g, `[${databaseName}]`);
  const marker = '-- Application API procedures used by role-specific backend pools.';
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Application procedure section not found in ${filePath}`);
  for (const batch of splitBatches(source.slice(start))) await pool.request().batch(batch);
};
(async () => {
  let pool;
  try {
    if (action === 'build') {
      const master = await createPool('master');
      try {
        await master.request().input('databaseName', sql.NVarChar(128), databaseName).query(`
          IF DB_ID(@databaseName) IS NULL
          BEGIN
            DECLARE @sql nvarchar(max) = N'CREATE DATABASE ' + QUOTENAME(@databaseName);
            EXEC sys.sp_executesql @sql;
          END;
        `);
      } finally { await master.close(); }
      pool = await createPool(databaseName);
      const tableCount = (await pool.request().query('SELECT COUNT(*) AS tableCount FROM sys.tables')).recordset[0].tableCount;
      if (Number(tableCount) !== 0) throw new Error(`Refusing to build over non-empty database ${databaseName} (${tableCount} tables). No data was changed.`);
      for (const file of ['02_CreateTables.sql','03_Constraints.sql','05_Triggers.sql','06_Views.sql','07_Functions.sql','08_StoredProcedures.sql','09_Indexes.sql','11_Security.sql']) await runFile(pool, file);
    } else {
      pool = await createPool(databaseName);
      if (action === 'seed') await runFile(pool, '04_SeedData.sql');
      else if (action === 'verify') await runFile(pool, '14_Verify.sql');
      else if (action === 'security') { await runAppProcedures(pool); await runFile(pool, '11_Security.sql'); }
      else if (action === 'migrate') {
        await runFile(pool, 'Migrations/20261021_CurriculumAndInvariants.sql');
        for (const file of ['05_Triggers.sql','06_Views.sql','07_Functions.sql','08_StoredProcedures.sql','09_Indexes.sql','11_Security.sql']) await runFile(pool, file);
      } else { await runAppProcedures(pool); for (const file of ['tests/13_Test_Integration.sql','14_Verify.sql','tests/14_RolePermissions.sql','tests/15_InvariantRejections.sql','tests/16_AppProcedurePermissions.sql']) await runFile(pool, file); }
    }
    console.log(`✓ ${action} completed for ${databaseName}`);
  } catch (error) {
    const location = error.lineNumber ? ` (line ${error.lineNumber}${error.number ? `, SQL ${error.number}` : ''})` : '';
    console.error(`✗ ${action} failed${location}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
})();
