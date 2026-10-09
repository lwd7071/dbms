const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { loginSchema } = require('../validators/auth.validator');
const { verifyToken } = require('../middlewares/auth.middleware');

// Đăng nhập tài khoản
router.post('/login', validate(loginSchema, 'body'), authController.login);

// Lấy thông tin tài khoản hiện tại từ token
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
