const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validate } = require('../middlewares/validate.middleware');
const { courseQuerySchema } = require('../validators/course.validator');
const { verifyToken, authorizeRoles, authorizeCourseStudentQuery } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI'));

// Lấy danh sách lớp học phần mở đăng ký
router.get('/available', authorizeCourseStudentQuery, validate(courseQuerySchema, 'query'), courseController.getAvailableCourses);

module.exports = router;
