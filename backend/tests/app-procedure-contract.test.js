const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const appSql = read('DB/08_StoredProcedures.sql');
const securitySql = read('DB/11_Security.sql');
const standaloneSql = read('DB/00_Build_DBMS330284.sql');

describe('role-scoped SQL procedure contract', () => {
  test('every repository procedure exists and has an explicit role grant', () => {
    const repositoryDirectory = path.join(root, 'backend/src/repositories');
    const repositorySql = fs.readdirSync(repositoryDirectory)
      .map(file => fs.readFileSync(path.join(repositoryDirectory, file), 'utf8')).join('\n');
    const names = [...new Set([...repositorySql.matchAll(/execute\(['"]dbo\.([A-Za-z0-9_]+)/g)].map(match => match[1]))];

    for (const name of names) {
      expect(appSql).toMatch(new RegExp('PROCEDURE\\s+(?:\\[dbo\\]\\.|dbo\\.)\\[?' + name + '\\]?\\b', 'i'));
      expect(securitySql).toContain('GRANT EXECUTE ON dbo.' + name);
      expect(standaloneSql).toMatch(new RegExp('PROCEDURE\\s+(?:\\[dbo\\]\\.|dbo\\.)\\[?' + name + '\\]?\\b', 'i'));
      expect(standaloneSql).toContain('GRANT EXECUTE ON dbo.' + name);
    }
  });

  test('runner can reapply only the application-procedure section before permissions', () => {
    expect(appSql).toContain('-- Application API procedures used by role-specific backend pools.');
    expect(read('backend/scripts/run_all_db_files.js')).toContain('runAppProcedures(pool);');
  });

  test.each([
    'SP_App_Auth_UpdateLastLogin',
    'SP_App_Registration_Create',
    'SP_App_Registration_Cancel',
    'SP_App_Class_CreateHomeroom',
    'SP_App_Class_UpdateHomeroom',
    'SP_App_Class_DeleteHomeroom',
    'SP_App_Lecturer_UpdateClassGrades',
    'SP_App_Tuition_CreatePayment',
    'SP_App_Tuition_ConfirmPayment',
    'SP_App_Tuition_RejectPayment',
    'SP_App_Admin_UserStatus',
    'SP_App_Admin_Student_Create',
    'SP_App_Admin_Student_Update',
    'SP_App_Admin_Student_Delete',
    'SP_App_Admin_CurriculumProgram_Create',
    'SP_App_Admin_CurriculumProgram_Update',
    'SP_App_Admin_CurriculumProgram_Delete'
  ])('%s sets and clears the audit actor context', name => {
    const start = appSql.indexOf('PROCEDURE dbo.' + name);
    expect(start).toBeGreaterThanOrEqual(0);
    const end = appSql.indexOf('\nGO', start);
    const definition = appSql.slice(start, end < 0 ? undefined : end);
    expect(definition).toContain("sp_set_session_context @key=N'MaTaiKhoan'");
    expect(definition).toMatch(/@value\s*=\s*@(ActorMaTaiKhoan|MaTaiKhoan)/);
    expect(definition).toMatch(/@value\s*=\s*NULL/);
  });
});
