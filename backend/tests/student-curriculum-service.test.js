jest.mock('../src/repositories/student.repository', () => ({
  getStudentCurriculum: jest.fn()
}));

const studentRepo = require('../src/repositories/student.repository');
const studentService = require('../src/services/student.service');

describe('student curriculum service', () => {
  test('groups courses into every expected semester and keeps empty semesters visible', async () => {
    studentRepo.getStudentCurriculum.mockResolvedValue([
      {
        MaCTDT: 'CTDT1', TenCTDT: 'Kỹ thuật phần mềm', Nganh: 'KTPM', KhoaHoc: '2024-2028',
        NamTuyenSinh: 2024, TongTinChiYeuCau: 135, ThoiGianDaoTao: 4,
        TrangThaiCTDT: true, MaKhoa: 'CNTT', TenKhoa: 'Công nghệ thông tin',
        MaMonHoc: 'CS101', TenMonHoc: 'Nhập môn lập trình', SoTinChi: 3,
        HocKyDuKien: 1, LoaiMon: 'BAT_BUOC', ThuTu: 1,
        HocPhanTienQuyet: 'CS001 - Nhập môn máy tính'
      },
      {
        MaCTDT: 'CTDT1', TenCTDT: 'Kỹ thuật phần mềm', Nganh: 'KTPM', KhoaHoc: '2024-2028',
        NamTuyenSinh: 2024, TongTinChiYeuCau: 135, ThoiGianDaoTao: 4,
        TrangThaiCTDT: true, MaKhoa: 'CNTT', TenKhoa: 'Công nghệ thông tin',
        MaMonHoc: 'CS201', TenMonHoc: 'Cấu trúc dữ liệu', SoTinChi: 4,
        HocKyDuKien: 3, LoaiMon: 'BAT_BUOC', ThuTu: 1
      }
    ]);

    const curriculum = await studentService.getStudentCurriculum('42');

    expect(studentRepo.getStudentCurriculum).toHaveBeenCalledWith(42);
    expect(curriculum.hocKy).toHaveLength(8);
    expect(curriculum.hocKy[0].monHoc[0].maMonHoc).toBe('CS101');
    expect(curriculum.hocKy[0].monHoc[0].hocPhanTienQuyet).toBe('CS001 - Nhập môn máy tính');
    expect(curriculum.hocKy[1].monHoc).toEqual([]);
    expect(curriculum.hocKy[2].monHoc[0].maMonHoc).toBe('CS201');
  });

  test('returns null when the student has no assigned curriculum', async () => {
    studentRepo.getStudentCurriculum.mockResolvedValue([{ MaCTDT: null }]);
    await expect(studentService.getStudentCurriculum(42)).resolves.toBeNull();
  });
});
