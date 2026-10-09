const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const courseRoutes = require('./course.routes');
const registrationRoutes = require('./registration.routes');
const studentRoutes = require('./student.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const lecturerRoutes = require('./lecturer.routes');
const facultyRoutes = require('./faculty.routes');
const semesterRoutes = require('./semester.routes');
const classRoutes = require('./class.routes');

// Gắn các nhóm routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/registrations', registrationRoutes);
router.use('/students', studentRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/lecturers', lecturerRoutes);
router.use('/faculties', facultyRoutes);
router.use('/semesters', semesterRoutes);
router.use('/classes', classRoutes);

module.exports = router;
