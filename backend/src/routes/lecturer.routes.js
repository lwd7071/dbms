const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturer.controller');

// Lấy lịch dạy theo tuần của Giảng viên
router.get('/:id/schedule', lecturerController.getSchedule);

// Lấy danh sách các lớp học phần Giảng viên phụ trách
router.get('/:id/classes', lecturerController.getClasses);

// Lấy danh sách sinh viên và điểm trong lớp học phần
router.get('/classes/:maLHP/students', lecturerController.getClassStudents);

module.exports = router;
