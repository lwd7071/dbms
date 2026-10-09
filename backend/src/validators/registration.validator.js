const { z } = require('zod');

// Schema validate đăng ký tín chỉ
const createRegistrationSchema = z.object({
  maSV: z
    .number({ required_error: 'Mã sinh viên là bắt buộc.' })
    .int('Mã sinh viên phải là số nguyên.')
    .positive('Mã sinh viên không hợp lệ.'),
  maLHP: z
    .string({ required_error: 'Mã lớp học phần là bắt buộc.' })
    .trim()
    .min(1, 'Mã lớp học phần không được để trống.'),
  tinChiToiDa: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(25)
    .optional()
});

// Schema validate hủy đăng ký tín chỉ
const cancelRegistrationSchema = z.object({
  maSV: z
    .number()
    .int()
    .positive()
    .optional(),
  maLHP: z
    .string()
    .trim()
    .optional()
});

module.exports = {
  createRegistrationSchema,
  cancelRegistrationSchema
};
