const express = require('express');
const router = express.Router();
const regController = require('../controllers/registration.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createRegistrationSchema, cancelRegistrationSchema } = require('../validators/registration.validator');

// Đăng ký tín chỉ
router.post('/', validate(createRegistrationSchema, 'body'), regController.createRegistration);

// Hủy đăng ký tín chỉ
router.delete('/:id', validate(cancelRegistrationSchema, 'body'), regController.cancelRegistration);

// Tra cứu danh sách môn đã đăng ký của sinh viên
router.get('/my-courses', regController.getMyRegistrations);

module.exports = router;
