const { mapSqlError } = require('../src/utils/errorMapper');

test('maps missing schedules on an opened course section to a validation conflict', () => {
  expect(mapSqlError({ number: 51311 })).toMatchObject({ status: 409, field: 'lichHoc' });
});
