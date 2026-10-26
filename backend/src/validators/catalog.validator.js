const { z } = require('zod');

const courseSchema = z.object({
  maMonHoc: z.string().trim().min(1).max(15),
  maKhoa: z.string().trim().min(1).max(10),
  tenMonHoc: z.string().trim().min(2).max(150),
  soTinChi: z.number().int().min(1).max(255),
  soTietLyThuyet: z.number().int().min(0).max(32767),
  soTietThucHanh: z.number().int().min(0).max(32767),
  moTa: z.string().max(500).nullable().optional(),
  trangThai: z.boolean().optional()
});

const facultySchema = z.object({
  maKhoa: z.string().trim().min(1).max(10).regex(/^[\w-]+$/, 'Mã khoa không hợp lệ.'),
  tenKhoa: z.string().trim().min(2).max(100),
  email: z.union([z.string().trim().email().max(100), z.literal(''), z.null()]).optional(),
  soDienThoai: z.union([z.string().trim().max(15).regex(/^[0-9+(). -]*$/), z.literal(''), z.null()]).optional(),
  trangThai: z.boolean().optional()
});

const majorSchema = z.object({
  maNganh: z.string().trim().min(1).max(10).regex(/^[\w-]+$/, 'Mã ngành không hợp lệ.'),
  maKhoa: z.string().trim().min(1).max(10).regex(/^[\w-]+$/, 'Mã khoa không hợp lệ.'),
  tenNganh: z.string().trim().min(2).max(100),
  moTa: z.string().max(500).nullable().optional(),
  trangThai: z.boolean().optional()
});

const homeroomClassSchema = z.object({
  maLop: z.string().trim().min(1).max(20).regex(/^[\w-]+$/, 'Mã lớp không hợp lệ.'),
  tenLop: z.string().trim().min(2).max(100),
  maKhoa: z.string().trim().min(1).max(10).regex(/^[\w-]+$/, 'Mã khoa không hợp lệ.'),
  khoaHoc: z.string().trim().min(1).max(20),
  namNhapHoc: z.number().int().min(1900).max(2100),
  trangThai: z.boolean().optional()
});

const scheduleSchema = z.object({
  thu: z.number().int().min(2).max(8),
  tietBatDau: z.number().int().min(1).max(12),
  soTiet: z.number().int().min(1).max(6),
  phongHoc: z.string().trim().min(1).max(20)
}).refine(({ tietBatDau, soTiet }) => tietBatDau + soTiet - 1 <= 12, {
  message: 'Tiết học phải kết thúc không muộn hơn tiết 12.', path: ['soTiet']
});

const classSchema = z.object({
  maLHP: z.string().trim().min(1).max(20),
  maMonHoc: z.string().trim().min(1).max(15),
  maHocKy: z.number().int().positive(),
  maGiangVien: z.number().int().positive().nullable().optional(),
  tenLHP: z.string().trim().min(2).max(100),
  soLuongToiDa: z.number().int().positive().max(1000),
  trangThai: z.enum(['MO_DANG_KY', 'DANG_MO', 'DA_KHOA', 'DA_HUY']).optional(),
  schedules: z.array(scheduleSchema).optional()
});

const curriculumCourseSchema = z.object({
  course: courseSchema,
  placement: z.object({
    hocKyDuKien: z.number().int().min(1).max(20),
    loaiMon: z.enum(['BAT_BUOC', 'TU_CHON']),
    thuTu: z.number().int().positive().nullable().optional()
  }),
  prerequisites: z.array(z.object({
    maMonTienQuyet: z.string().trim().min(1).max(15),
    mucDo: z.enum(['BAT_BUOC', 'KHUYEN_NGHI'])
  })).optional().default([])
}).superRefine(({ course, prerequisites }, ctx) => {
  const seen = new Set();
  prerequisites.forEach((prerequisite, index) => {
    if (prerequisite.maMonTienQuyet === course.maMonHoc) {
      ctx.addIssue({ code: 'custom', path: ['prerequisites', index, 'maMonTienQuyet'], message: 'Môn học không thể tự làm tiên quyết cho chính nó.' });
    }
    if (seen.has(prerequisite.maMonTienQuyet)) {
      ctx.addIssue({ code: 'custom', path: ['prerequisites', index, 'maMonTienQuyet'], message: 'Môn tiên quyết không được lặp lại.' });
    }
    seen.add(prerequisite.maMonTienQuyet);
  });
});

const curriculumCourseCreateParamsSchema = z.object({ maCTDT: z.string().trim().min(1).max(24) });
const curriculumCourseParamsSchema = curriculumCourseCreateParamsSchema.extend({ maMonHoc: z.string().trim().min(1).max(15) });
const curriculumProgramSchema = z.object({
  maCTDT: z.string().trim().min(1).max(24).regex(/^[\w-]+$/, 'Mã CTĐT không hợp lệ.'),
  maNganh: z.string().trim().min(1).max(10).regex(/^[\w-]+$/, 'Mã ngành không hợp lệ.'),
  tenCTDT: z.string().trim().min(2).max(150),
  namTuyenSinh: z.number().int().min(2000).max(2100),
  tongTinChiYeuCau: z.number().int().positive(),
  thoiGianDaoTao: z.number().int().positive(),
  trangThai: z.boolean().optional()
});
const curriculumProgramParamsSchema = z.object({ maCTDT: z.string().trim().min(1).max(24).regex(/^[\w-]+$/, 'Mã CTĐT không hợp lệ.') });
const classScheduleParamsSchema = z.object({
  id: z.string().trim().min(1).max(20),
  scheduleId: z.preprocess(value => Number(value), z.number().int().positive())
});

module.exports = { courseSchema, classSchema, facultySchema, majorSchema, homeroomClassSchema, curriculumCourseSchema, curriculumCourseCreateParamsSchema, curriculumCourseParamsSchema, curriculumProgramSchema, curriculumProgramParamsSchema, scheduleSchema, classScheduleParamsSchema };
