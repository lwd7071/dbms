const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');

// GET /api/faculties - Lấy danh sách toàn bộ khoa
router.get('/', facultyController.getFaculties);

module.exports = router;
