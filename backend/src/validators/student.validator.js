const { z } = require('zod');

const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
};
const dateSchema = z.string().refine(validDate, 'Ngày sinh phải là ngày hợp lệ theo định dạng YYYY-MM-DD.').nullable().optional();

const createStudentSchema = z.object({
  maSinhVien: z.string().trim().min(3, 'Mã sinh viên tối thiểu 3 ký tự').max(20),
  hoTen: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  ngaySinh: dateSchema,
  email: z.string().email('Email không đúng định dạng').optional().nullable(),
  soDienThoai: z.string().max(20).optional().nullable(),
  maKhoa: z.string().trim().min(1, 'Khoa là bắt buộc').max(10),
  maCTDT: z.string().trim().min(1, 'Chương trình đào tạo là bắt buộc').max(24),
  maLop: z.string().trim().max(20).optional().nullable(),
  trangThai: z.enum(['DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'THOI_HOC']).default('DANG_HOC')
});

const updateStudentSchema = z.object({
  hoTen: z.string().trim().min(2).max(100).optional(),
  ngaySinh: dateSchema,
  email: z.string().email('Email không đúng định dạng').optional().nullable(),
  soDienThoai: z.string().max(20).optional().nullable(),
  maKhoa: z.string().trim().max(10).optional(),
  maCTDT: z.string().trim().min(1).max(24).optional(),
  maLop: z.string().trim().max(20).optional().nullable(),
  trangThai: z.enum(['DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'THOI_HOC']).optional()
});

module.exports = {
  createStudentSchema,
  updateStudentSchema
};
