const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validate } = require('../middlewares/validate.middleware');
const { courseQuerySchema } = require('../validators/course.validator');

// Lấy danh sách lớp học phần mở đăng ký
router.get('/available', validate(courseQuerySchema, 'query'), courseController.getAvailableCourses);

module.exports = router;
