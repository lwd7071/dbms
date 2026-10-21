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

const classSchema = z.object({
  maLHP: z.string().trim().min(1).max(20),
  maMonHoc: z.string().trim().min(1).max(15),
  maHocKy: z.number().int().positive(),
  maGiangVien: z.number().int().positive().nullable().optional(),
  tenLHP: z.string().trim().min(2).max(100),
  soLuongToiDa: z.number().int().positive().max(1000),
  trangThai: z.enum(['MO_DANG_KY', 'DANG_MO', 'DA_KHOA', 'DA_HUY']).optional()
});

module.exports = { courseSchema, classSchema };
