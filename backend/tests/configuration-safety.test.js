const { mapSqlError } = require('../src/utils/errorMapper');
const { assertRequiredEnvironment } = require('../src/config/env');

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
});
