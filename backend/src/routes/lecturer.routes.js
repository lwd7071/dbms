const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturer.controller');

const { validate } = require('../middlewares/validate.middleware');
const { updateGradesSchema } = require('../validators/lecturer.validator');

// Lấy lịch dạy theo tuần của Giảng viên
router.get('/:id/schedule', lecturerController.getSchedule);

// Lấy danh sách các lớp học phần Giảng viên phụ trách
router.get('/:id/classes', lecturerController.getClasses);

// Lấy danh sách sinh viên và điểm trong lớp học phần
router.get('/classes/:maLHP/students', lecturerController.getClassStudents);

// Giảng viên cập nhật điểm của sinh viên trong lớp học phần
router.put('/classes/:maLHP/grades', validate(updateGradesSchema), lecturerController.updateGrades);

module.exports = router;
