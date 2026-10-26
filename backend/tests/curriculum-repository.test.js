const mockRecord = {
  MaCTDT: 'CTDT1', TenCTDT: 'Chương trình mẫu', Nganh: 'CNTT', KhoaHoc: '2024-2028', NamTuyenSinh: 2024,
  TongTinChiYeuCau: 135, ThoiGianDaoTao: 4, TrangThaiCTDT: true, MaKhoa: 'CNTT', TenKhoa: 'Công nghệ thông tin',
  MaMonHoc: 'CS101', MaKhoaMon: 'CNTT', TenKhoaMon: 'Công nghệ thông tin', TenMonHoc: 'Nhập môn lập trình',
  SoTinChi: 3, SoTietLyThuyet: 30, SoTietThucHanh: 15, MoTa: 'Môn học nhập môn', TrangThaiMon: true,
  HocKyDuKien: 1, LoaiMon: 'BAT_BUOC', ThuTu: 1, HocPhanTienQuyet: 'CS001 - Cơ sở máy tính',
  HocPhanTienQuyetChiTiet: '[{"maMonHoc":"CS001","tenMonHoc":"Cơ sở máy tính","mucDo":"KHUYEN_NGHI"}]'
};

jest.mock('../src/config/db', () => {
  const query = jest.fn(async () => ({ recordset: [mockRecord] }));
  const request = { input: jest.fn().mockReturnThis(), query };
  const pool = { request: jest.fn(() => request) };
  return {
    getPool: jest.fn(async () => pool),
    sql: { Int: 'Int', SmallInt: 'SmallInt', TinyInt: 'TinyInt', NVarChar: () => 'NVarChar', VarChar: () => 'VarChar' },
    __query: query
  };
});

const db = require('../src/config/db');
const adminRepository = require('../src/repositories/admin.repository');
const studentRepository = require('../src/repositories/student.repository');

describe('curriculum repositories', () => {
  beforeEach(() => db.__query.mockClear());

  test('admin curriculum repository maps full course and prerequisite details', async () => {
    const [course] = await adminRepository.getCurriculums();
    expect(course).toEqual(expect.objectContaining({
      maKhoaMon: 'CNTT', tenKhoaMon: 'Công nghệ thông tin', soTietLyThuyet: 30,
      soTietThucHanh: 15, moTa: 'Môn học nhập môn', trangThaiMon: true,
      hocPhanTienQuyetChiTiet: [{ maMonHoc: 'CS001', tenMonHoc: 'Cơ sở máy tính', mucDo: 'KHUYEN_NGHI' }]
    }));
    expect(db.__query.mock.calls.at(-1)[0]).toContain('FOR JSON PATH');
    expect(db.__query.mock.calls.at(-1)[0]).toContain('mh.SoTietLyThuyet');
  });

  test('student curriculum repository selects full course and prerequisite details', async () => {
    const [course] = await studentRepository.getStudentCurriculum(7);
    expect(course).toEqual(expect.objectContaining({
      MaKhoaMon: 'CNTT', TenKhoaMon: 'Công nghệ thông tin', SoTietLyThuyet: 30,
      SoTietThucHanh: 15, MoTa: 'Môn học nhập môn', TrangThaiMon: true,
      HocPhanTienQuyetChiTiet: '[{"maMonHoc":"CS001","tenMonHoc":"Cơ sở máy tính","mucDo":"KHUYEN_NGHI"}]'
    }));
    expect(db.__query.mock.calls.at(-1)[0]).toContain('FOR JSON PATH');
    expect(db.__query.mock.calls.at(-1)[0]).toContain('mh.SoTietThucHanh');
  });

  test('admin curriculum query supports major and prerequisite filters with matching course rows', async () => {
    await adminRepository.getCurriculums({ maNganh: 'N06', maMonTienQuyet: 'CS001' });
    const query = db.__query.mock.calls.at(-1)[0];
    expect(query).toContain('c.MaNganh = @MaNganh');
    expect(query).toContain('rowMtq.MaMonTienQuyet = @MaMonTienQuyet');
    expect(query).toContain('filterMtq.MaMonTienQuyet = @MaMonTienQuyet');
  });

  test('admin curriculum search matches a course code or course name', async () => {
    await adminRepository.getCurriculums({ tuKhoaMonHoc: 'CSDL' });
    const query = db.__query.mock.calls.at(-1)[0];
    expect(query).toContain('mh.MaMonHoc LIKE @TuKhoaMonHoc');
    expect(query).toContain('mh.TenMonHoc LIKE @TuKhoaMonHoc');
  });

  test('student query rejects a class outside the selected faculty before listing students', async () => {
    db.__query.mockResolvedValueOnce({ recordset: [] });
    await expect(adminRepository.getStudentsList({ maKhoa: 'CNTT', maLop: 'ATTT25_01' }))
      .rejects.toMatchObject({ status: 400, field: 'maLop' });
    expect(db.__query).toHaveBeenCalledTimes(1);
    expect(db.__query.mock.calls[0][0]).toContain('WHERE MaKhoa = @MaKhoaCheck AND MaLop = @MaLopCheck');
  });

  test('registration filters use exact MSSV and section-code predicates', async () => {
    await adminRepository.getRegistrationsList({ maSinhVien: '24110202', maLHP: 'ATTT25_01' });
    const query = db.__query.mock.calls.at(-1)[0];
    expect(query).toContain('sv.MaSinhVien = @MaSinhVien');
    expect(query).toContain('dk.MaLHP = @MaLHP');
  });

  test('audit and lecturer filters use indexed faculty/status/account/time columns', async () => {
    await adminRepository.getAuditLogs({ maTaiKhoan: 18, tuNgay: '2026-10-01', denNgay: '2026-10-26' });
    expect(db.__query.mock.calls.at(-2)[0]).toContain('lg.MaTaiKhoan = @MaTaiKhoan');
    expect(db.__query.mock.calls.at(-2)[0]).toContain('lg.ThoiGian >= @TuNgay');
    expect(db.__query.mock.calls.at(-2)[0]).toContain('lg.ThoiGian < DATEADD(day, 1, @DenNgay)');
    await adminRepository.getLecturerOptions({ maKhoa: 'CNTT', trangThai: 'DANG_CONG_TAC' });
    expect(db.__query.mock.calls.at(-1)[0]).toContain('MaKhoa = @MaKhoa AND TrangThai = @TrangThai');
  });
});
