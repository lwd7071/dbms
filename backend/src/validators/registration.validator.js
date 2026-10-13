const { z } = require('zod');

// Schema validate đăng ký tín chỉ
const createRegistrationSchema = z.object({
  maLHP: z
    .string({ required_error: 'Mã lớp học phần là bắt buộc.' })
    .trim()
    .min(1, 'Mã lớp học phần không được để trống.'),
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
