const { z } = require('zod');

// Schema validate query params cho tra cứu lớp học phần
const courseQuerySchema = z.object({
  page: z
    .preprocess((val) => (val === undefined || val === '' ? 1 : Number(val)), z.number().int().min(1, 'Số trang phải lớn hơn hoặc bằng 1.'))
    .default(1),
  pageSize: z
    .preprocess((val) => (val === undefined || val === '' ? 10 : Number(val)), z.number().int().min(1).max(100, 'Số lượng mỗi trang tối đa 100.'))
    .default(10),
  maHocKy: z
    .preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().int().positive().optional()),
  maKhoa: z
    .string()
    .trim()
    .max(10)
    .optional(),
  search: z
    .string()
    .trim()
    .max(100)
    .optional(),
  type: z
    .enum(['PLAN', 'OTHER', 'ALL'])
    .optional(),
  maSV: z
    .preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().int().positive().optional())
});

module.exports = {
  courseQuerySchema
};
