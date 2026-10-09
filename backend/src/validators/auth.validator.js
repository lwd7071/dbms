const { z } = require('zod');

// Schema kiểm tra dữ liệu đăng nhập
const loginSchema = z.object({
  username: z
    .string({ required_error: 'Tên đăng nhập là bắt buộc.' })
    .trim()
    .min(1, 'Tên đăng nhập không được để trống.'),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc.' })
    .min(1, 'Mật khẩu không được để trống.')
});

module.exports = {
  loginSchema
};
