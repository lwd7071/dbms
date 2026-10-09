const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// Thời khóa biểu
router.get('/:id/schedule', studentController.getSchedule);

// Bảng điểm
router.get('/:id/grades', studentController.getGrades);

// Công nợ học phí
router.get('/:id/tuition', studentController.getTuition);

// Lịch sử thanh toán học phí
router.get('/:id/payments', studentController.getPaymentHistory);

// Thông tin hồ sơ sinh viên
router.get('/:id/profile', studentController.getProfile);

module.exports = router;
