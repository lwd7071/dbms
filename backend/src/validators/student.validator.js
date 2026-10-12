const { z } = require('zod');

const createStudentSchema = z.object({
  maSinhVien: z.string().trim().min(3, 'Mã sinh viên tối thiểu 3 ký tự').max(20),
  hoTen: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  ngaySinh: z.string().optional().nullable(),
  email: z.string().email('Email không đúng định dạng').optional().nullable(),
  soDienThoai: z.string().max(20).optional().nullable(),
  maKhoa: z.string().trim().min(1, 'Khoa là bắt buộc').max(10),
  maLop: z.string().trim().max(20).optional().nullable(),
  trangThai: z.enum(['DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'THOI_HOC']).default('DANG_HOC')
});

const updateStudentSchema = z.object({
  hoTen: z.string().trim().min(2).max(100).optional(),
  ngaySinh: z.string().optional().nullable(),
  email: z.string().email('Email không đúng định dạng').optional().nullable(),
  soDienThoai: z.string().max(20).optional().nullable(),
  maKhoa: z.string().trim().max(10).optional(),
  maLop: z.string().trim().max(20).optional().nullable(),
  trangThai: z.enum(['DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'THOI_HOC']).optional()
});

module.exports = {
  createStudentSchema,
  updateStudentSchema
};
