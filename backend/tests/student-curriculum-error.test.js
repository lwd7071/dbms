const { mapSqlError } = require('../src/utils/errorMapper');

test('maps the student curriculum consistency trigger in student write context', () => {
  expect(mapSqlError({ number: 51008 }, 'STUDENT_CLASS')).toMatchObject({ status: 422, field: 'maCTDT' });
});
