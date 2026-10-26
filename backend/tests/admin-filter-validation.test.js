const {
  adminStudentsQuerySchema,
  adminLecturersQuerySchema,
  adminRegistrationsQuerySchema,
  adminAuditQuerySchema,
  curriculumsQuerySchema
} = require('../src/validators/common.validator');

describe('admin filter query contracts', () => {
  test('accepts supported student, lecturer, registration and curriculum filters', () => {
    expect(adminStudentsQuerySchema.parse({ maKhoa: 'CNTT', maLop: 'CNTT25_01', trangThai: 'DANG_HOC' })).toEqual(expect.objectContaining({ trangThai: 'DANG_HOC' }));
    expect(adminLecturersQuerySchema.parse({ maKhoa: 'CNTT', trangThai: 'DANG_CONG_TAC' })).toEqual({ maKhoa: 'CNTT', trangThai: 'DANG_CONG_TAC' });
    expect(adminRegistrationsQuerySchema.parse({ maSinhVien: '24110202', maLHP: 'ATTT25_01' })).toEqual(expect.objectContaining({ maSinhVien: '24110202', maLHP: 'ATTT25_01' }));
    expect(adminAuditQuerySchema.parse({ maTaiKhoan: '18', tuNgay: '2026-10-01', denNgay: '2026-10-26' })).toEqual(expect.objectContaining({ maTaiKhoan: 18 }));
    expect(curriculumsQuerySchema.parse({ maKhoa: 'CNTT', maNganh: 'N01', maMonTienQuyet: 'CS001', tuKhoaMonHoc: 'CSDL' })).toEqual(expect.objectContaining({ maNganh: 'N01', maMonTienQuyet: 'CS001', tuKhoaMonHoc: 'CSDL' }));
  });

  test('rejects unsupported status codes and invalid audit date ranges', () => {
    expect(adminLecturersQuerySchema.safeParse({ trangThai: 'ACTIVE' }).success).toBe(false);
    expect(adminAuditQuerySchema.safeParse({ tuNgay: '2026-10-20', denNgay: '2026-10-01' }).success).toBe(false);
  });
});
