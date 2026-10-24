const { z } = require('zod');

const positiveIdParamsSchema = z.object({
  id: z.preprocess(
    value => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
    z.number().int().positive().safe('Mã hồ sơ phải là số nguyên dương hợp lệ.')
  )
});

const codeIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(30).regex(/^[\w-]+$/, 'Mã chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới.')
});

const classCodeParamsSchema = z.object({
  maLHP: z.string().trim().min(1).max(30).regex(/^[\w-]+$/, 'Mã lớp học phần không hợp lệ.')
});

const paginationShape = {
  page: z.preprocess(value => value === undefined || value === '' ? 1 : Number(value), z.number().int().min(1).max(100000)).default(1),
  pageSize: z.preprocess(value => value === undefined || value === '' ? 10 : Number(value), z.number().int().min(1).max(100)).default(10)
};

const optionalQueryEnum = values => z.preprocess(
  value => value === '' ? undefined : value,
  z.enum(values).optional()
);

const adminUsersQuerySchema = z.object({
  ...paginationShape,
  vaiTro: optionalQueryEnum(['SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI']),
  trangThai: optionalQueryEnum(['ACTIVE', 'LOCKED', 'DISABLED']),
  maLop: z.string().trim().max(20).optional(),
  search: z.string().trim().max(100).optional()
});

const adminStudentsQuerySchema = z.object({
  ...paginationShape,
  search: z.string().trim().max(100).optional(),
  maKhoa: z.string().trim().max(10).optional(),
  maLop: z.string().trim().max(20).optional(),
  trangThai: z.enum(['DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'THOI_HOC']).optional()
});

const adminClassesQuerySchema = z.object({
  ...paginationShape,
  maHocKy: z.preprocess(value => value === undefined || value === '' ? undefined : Number(value), z.number().int().positive().optional()),
  search: z.string().trim().max(100).optional()
});

const adminRegistrationsQuerySchema = z.object({
  ...paginationShape,
  maSV: z.preprocess(value => value === undefined || value === '' ? undefined : Number(value), z.number().int().positive().optional()),
  maLHP: z.string().trim().max(20).optional(),
  maLop: z.string().trim().max(20).optional(),
  trangThai: optionalQueryEnum(['REGISTERED', 'CANCELLED']),
  search: z.string().trim().max(100).optional()
});

const adminAuditQuerySchema = z.object({
  ...paginationShape,
  limit: z.preprocess(value => value === undefined || value === '' ? undefined : Number(value), z.number().int().min(1).max(100).optional())
});

const curriculumOptionsQuerySchema = z.object({
  maKhoa: z.string().trim().min(1).max(10).optional(),
  namTuyenSinh: z.preprocess(
    value => value === undefined || value === '' ? undefined : Number(value),
    z.number().int().min(2000).max(2100).optional()
  )
});

const curriculumsQuerySchema = z.object({
  maKhoa: z.preprocess(value => value === '' ? undefined : value, z.string().trim().min(1).max(10).optional()),
  namTuyenSinh: z.preprocess(value => value === undefined || value === '' ? undefined : Number(value), z.number().int().min(2000).max(2100).optional()),
  maCTDT: z.preprocess(value => value === '' ? undefined : value, z.string().trim().min(1).max(24).optional()),
  hocKyDuKien: z.preprocess(value => value === undefined || value === '' ? undefined : Number(value), z.number().int().min(1).max(20).optional())
});

const pendingPaymentsQuerySchema = z.object({
  maLop: z.string().trim().max(20, 'Mã lớp sinh hoạt tối đa 20 ký tự.').optional()
});

module.exports = {
  positiveIdParamsSchema,
  codeIdParamsSchema,
  classCodeParamsSchema,
  adminUsersQuerySchema,
  adminStudentsQuerySchema,
  adminClassesQuerySchema,
  adminRegistrationsQuerySchema,
  adminAuditQuerySchema,
  curriculumOptionsQuerySchema,
  curriculumsQuerySchema,
  pendingPaymentsQuerySchema
};
