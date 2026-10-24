const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken, authorizeRoles, authorizeStudentRecord } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('SINH_VIEN', 'DAO_TAO', 'QUAN_TRI'));

// Thời khóa biểu
router.get('/:id/schedule', authorizeStudentRecord, studentController.getSchedule);

// Bảng điểm
router.get('/:id/grades', authorizeStudentRecord, studentController.getGrades);

// Công nợ học phí
router.get('/:id/tuition', authorizeStudentRecord, studentController.getTuition);

// Lịch sử thanh toán học phí
router.get('/:id/payments', authorizeStudentRecord, studentController.getPaymentHistory);

// Thông tin hồ sơ sinh viên
router.get('/:id/profile', authorizeStudentRecord, studentController.getProfile);
router.get('/:id/curriculum', authorizeStudentRecord, studentController.getCurriculum);

module.exports = router;
