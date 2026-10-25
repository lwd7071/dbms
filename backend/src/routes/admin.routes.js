const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const facultyController = require('../controllers/faculty.controller');
const { validate } = require('../middlewares/validate.middleware');
const { tuitionReportQuerySchema } = require('../validators/payment.validator');
const { createStudentSchema, updateStudentSchema } = require('../validators/student.validator');
const { courseSchema, classSchema } = require('../validators/catalog.validator');
const { accountStatusSchema, usernameParamsSchema } = require('../validators/admin.validator');
const {
  positiveIdParamsSchema, codeIdParamsSchema, adminUsersQuerySchema,
  adminStudentsQuerySchema, adminClassesQuerySchema,
  adminRegistrationsQuerySchema, adminAuditQuerySchema, curriculumOptionsQuerySchema, curriculumsQuerySchema
} = require('../validators/common.validator');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'));

// Báo cáo thống kê tài chính học phí (SP_ThongKeHocPhi)
router.get('/reports/tuition', validate(tuitionReportQuerySchema, 'query'), adminController.getTuitionReport);

// Quản lý danh sách tài khoản người dùng (V_TaiKhoanNguoiDung)
router.get('/users', validate(adminUsersQuerySchema, 'query'), adminController.getUsers);

// Cập nhật trạng thái tài khoản (ACTIVE / LOCKED)
router.patch('/users/:username/status', validate(usernameParamsSchema, 'params'), validate(accountStatusSchema), adminController.updateUserStatus);

// Thống kê tổng quan Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/faculties', facultyController.getFacultiesForStaff);

// Quản lý sinh viên (CRUD)
router.get('/students', validate(adminStudentsQuerySchema, 'query'), adminController.getStudents);
router.post('/students', validate(createStudentSchema), adminController.createStudent);
router.put('/students/:id', validate(positiveIdParamsSchema, 'params'), validate(updateStudentSchema), adminController.updateStudent);
router.delete('/students/:id', validate(positiveIdParamsSchema, 'params'), adminController.deleteStudent);

// Quản lý tất cả lớp học phần
router.get('/classes', validate(adminClassesQuerySchema, 'query'), adminController.getAllClasses);
router.post('/classes', validate(classSchema), adminController.createClass);
router.put('/classes/:id', validate(codeIdParamsSchema, 'params'), validate(classSchema.omit({ maLHP: true })), adminController.updateClass);
router.delete('/classes/:id', validate(codeIdParamsSchema, 'params'), adminController.deleteClass);
router.get('/courses', adminController.getCourses);
router.post('/courses', validate(courseSchema), adminController.createCourse);
router.put('/courses/:id', validate(codeIdParamsSchema, 'params'), validate(courseSchema.omit({ maMonHoc: true })), adminController.updateCourse);
router.delete('/courses/:id', validate(codeIdParamsSchema, 'params'), adminController.deleteCourse);

// Quản lý đăng ký tín chỉ
router.get('/registrations', validate(adminRegistrationsQuerySchema, 'query'), adminController.getRegistrations);

// Nhật ký hoạt động hệ thống (LOGHOATDONG)
router.get('/audit-logs', authorizeRoles('QUAN_TRI'), validate(adminAuditQuerySchema, 'query'), adminController.getAuditLogs);

// Khung chương trình đào tạo (V_CauTrucChuongTrinhDaoTao)
router.get('/curriculums', validate(curriculumsQuerySchema, 'query'), adminController.getCurriculums);
router.get('/curriculum-options', validate(curriculumOptionsQuerySchema, 'query'), adminController.getCurriculumOptions);

module.exports = router;
