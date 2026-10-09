const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middlewares/validate.middleware');
const { tuitionReportQuerySchema } = require('../validators/payment.validator');

// Báo cáo thống kê tài chính học phí (SP_ThongKeHocPhi)
router.get('/reports/tuition', validate(tuitionReportQuerySchema, 'query'), adminController.getTuitionReport);

// Quản lý danh sách tài khoản người dùng (V_TaiKhoanNguoiDung)
router.get('/users', adminController.getUsers);

// Cập nhật trạng thái tài khoản (ACTIVE / LOCKED)
router.patch('/users/:username/status', adminController.updateUserStatus);

// Thống kê tổng quan Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Quản lý sinh viên
router.get('/students', adminController.getStudents);

// Quản lý tất cả lớp học phần
router.get('/classes', adminController.getAllClasses);

// Quản lý đăng ký tín chỉ
router.get('/registrations', adminController.getRegistrations);

// Nhật ký hoạt động hệ thống (LOGHOATDONG)
router.get('/audit-logs', adminController.getAuditLogs);

// Khung chương trình đào tạo (V_CauTrucChuongTrinhDaoTao)
router.get('/curriculums', adminController.getCurriculums);

module.exports = router;
