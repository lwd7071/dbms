const { createStudentSchema } = require('../src/validators/student.validator');

describe('student curriculum validation', () => {
  const requiredFields = {
    maSinhVien: '2026001', hoTen: 'Nguyễn An', maKhoa: 'CNTT',
    maLop: 'CNTT26_01', trangThai: 'DANG_HOC'
  };

  test('requires a curriculum identifier for newly assigned students', () => {
    expect(createStudentSchema.safeParse(requiredFields).success).toBe(false);
    expect(createStudentSchema.safeParse({ ...requiredFields, maCTDT: 'CTDT_CNTT_CQ_26' }).success).toBe(true);
  });
});
