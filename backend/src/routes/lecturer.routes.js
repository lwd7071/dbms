const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturer.controller');

const { validate } = require('../middlewares/validate.middleware');
const { updateGradesSchema } = require('../validators/lecturer.validator');
const { classCodeParamsSchema } = require('../validators/common.validator');
const { verifyToken, authorizeRoles, authorizeLecturerRecord } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('GIANG_VIEN'));

// Lấy lịch dạy theo tuần của Giảng viên
router.get('/:id/schedule', authorizeLecturerRecord, lecturerController.getSchedule);

// Lấy danh sách các lớp học phần Giảng viên phụ trách
router.get('/:id/classes', authorizeLecturerRecord, lecturerController.getClasses);

// Lấy danh sách sinh viên và điểm trong lớp học phần
router.get('/classes/:maLHP/students', lecturerController.getClassStudents);

// Giảng viên cập nhật điểm của sinh viên trong lớp học phần
router.put('/classes/:maLHP/grades', validate(classCodeParamsSchema, 'params'), validate(updateGradesSchema), lecturerController.updateGrades);

module.exports = router;
