const { mapSqlError } = require('../src/utils/errorMapper');
const { assertRequiredEnvironment } = require('../src/config/env');

const roleEnvironment = {
  DB_USER: 'dbms_app',
  DB_PASSWORD: 'auth-secret',
  DB_STUDENT_USER: 'dbms_student',
  DB_STUDENT_PASSWORD: 'student-secret',
  DB_LECTURER_USER: 'dbms_lecturer',
  DB_LECTURER_PASSWORD: 'lecturer-secret',
  DB_TRAINING_USER: 'dbms_training',
  DB_TRAINING_PASSWORD: 'training-secret',
  DB_ADMIN_USER: 'dbms_admin',
  DB_ADMIN_PASSWORD: 'admin-secret',
  JWT_SECRET: 'jwt-secret'
};

describe('configuration and database error safety', () => {
  test('SQL errors outside the business map do not expose SQL text', () => {
    const mapped = mapSqlError({ number: 99999, message: 'SELECT password FROM dbo.TAIKHOAN' });
    expect(mapped.status).toBe(500);
    expect(mapped.message).not.toContain('SELECT');
    expect(mapped.message).not.toContain('TAIKHOAN');
  });

  test('server configuration fails clearly when a required secret is absent', () => {
    expect(() => assertRequiredEnvironment({ DB_USER: 'demo', DB_PASSWORD: 'demo' }))
      .toThrow(/JWT_SECRET/);
  });

  test('server configuration requires a distinct SQL login for every application role', () => {
    const { DB_TRAINING_PASSWORD, ...missingTrainingPassword } = roleEnvironment;

    expect(() => assertRequiredEnvironment(missingTrainingPassword))
      .toThrow(/DB_TRAINING_PASSWORD/);
  });

  test('SQL permission failures become a safe forbidden response', () => {
    expect(mapSqlError({ number: 229, message: 'EXECUTE denied on dbo.SP_App_Faculty_DeleteFaculty' }))
      .toEqual({
        status: 403,
        field: 'permission',
        message: 'Bạn không có quyền thực hiện thao tác này.'
      });
  });

  test('new admin procedure errors preserve their HTTP business status', () => {
    expect(mapSqlError({ number: 52072 })).toMatchObject({ status: 403, field: 'permission' });
    expect(mapSqlError({ number: 52080 })).toMatchObject({ status: 409, field: 'maSinhVien' });
    expect(mapSqlError({ number: 52084 })).toMatchObject({ status: 409, field: 'maCTDT' });
  });

  test('SQL connection timeouts become retryable service errors', () => {
    expect(mapSqlError({ code: 'ETIMEOUT' })).toEqual({
      status: 503,
      field: 'database',
      message: 'Không thể kết nối dữ liệu lúc này. Vui lòng thử lại sau.'
    });
  });
});
