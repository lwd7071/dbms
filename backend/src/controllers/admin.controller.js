const tuitionService = require('../services/tuition.service');
const adminRepo = require('../repositories/admin.repository');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller cho Quản trị viên và Phòng Đào tạo
 */
const getTuitionReport = async (req, res, next) => {
  try {
    const { maHocKy, trangThai } = req.validated?.query || req.query;
    const report = await tuitionService.getTuitionReport({ maHocKy, trangThai });
    return res.status(200).json(successResponse(report));
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { vaiTro, trangThai, maLop, search, page, pageSize } = req.validated?.query || req.query;
    const result = await adminRepo.getUsersList({ vaiTro, trangThai, maLop, search, page, pageSize });
    return res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      })
    );
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { username } = req.validated?.params || req.params;
    const { trangThai } = req.body;
    req.context = 'ACCOUNT_STATUS';
    const result = await adminRepo.updateUserStatus(username, trangThai, req.user);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
};

const getCurriculums = async (req, res, next) => {
  try {
    const curriculums = await adminRepo.getCurriculums(req.validated?.query || req.query);
    return res.status(200).json(successResponse(curriculums));
  } catch (err) {
    next(err);
  }
};

const getCurriculumOptions = async (req, res, next) => {
  try {
    const { maKhoa, namTuyenSinh } = req.validated?.query || req.query;
    return res.status(200).json(successResponse(await adminRepo.getCurriculumOptions({ maKhoa, namTuyenSinh })));
  } catch (err) { next(err); }
};

const getCurriculumPrograms = async (req, res, next) => {
  try {
    return res.status(200).json(successResponse(await adminRepo.getCurriculumPrograms()));
  } catch (err) { next(err); }
};

const createCurriculumProgram = async (req, res, next) => {
  try { return res.status(201).json(successResponse(await adminRepo.createCurriculumProgram(req.body))); }
  catch (err) { req.context = 'CURRICULUM_PROGRAM'; next(err); }
};

const updateCurriculumProgram = async (req, res, next) => {
  try {
    return res.status(200).json(successResponse(await adminRepo.updateCurriculumProgram(req.params.maCTDT, req.body)));
  } catch (err) { req.context = 'CURRICULUM_PROGRAM'; next(err); }
};

const deleteCurriculumProgram = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.deleteCurriculumProgram(req.params.maCTDT))); }
  catch (err) { req.context = 'CURRICULUM_PROGRAM_DELETE'; next(err); }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminRepo.getDashboardStats();
    return res.status(200).json(successResponse(stats));
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const { search, maKhoa, maLop, trangThai, page, pageSize } = req.validated?.query || req.query;
    const result = await adminRepo.getStudentsList({ search, maKhoa, maLop, trangThai, page, pageSize });
    return res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      })
    );
  } catch (err) {
    next(err);
  }
};

const getAllClasses = async (req, res, next) => {
  try {
    const { maHocKy, search, page, pageSize } = req.validated?.query || req.query;
    const result = await adminRepo.getAllClasses({ maHocKy, search, page, pageSize });
    return res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      })
    );
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.getCourses())); }
  catch (err) { next(err); }
};

const getClassSection = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.getClassSection(req.params.id))); }
  catch (err) { next(err); }
};

const getLecturerOptions = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.getLecturerOptions(req.validated?.query || req.query))); }
  catch (err) { next(err); }
};

const createCourse = async (req, res, next) => {
  try { return res.status(201).json(successResponse(await adminRepo.createCourse(req.body))); }
  catch (err) { next(err); }
};

const updateCourse = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.updateCourse((req.validated?.params || req.params).id, req.body))); }
  catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.deleteCourse((req.validated?.params || req.params).id))); }
  catch (err) { next(err); }
};

const createCurriculumCourse = async (req, res, next) => {
  try {
    return res.status(201).json(successResponse(await adminRepo.createCurriculumCourse(req.params.maCTDT, req.body)));
  } catch (err) { next(err); }
};

const updateCurriculumCourse = async (req, res, next) => {
  try {
    return res.status(200).json(successResponse(await adminRepo.updateCurriculumCourse(req.params.maCTDT, req.params.maMonHoc, req.body)));
  } catch (err) { next(err); }
};

const deleteCurriculumCourse = async (req, res, next) => {
  try {
    return res.status(200).json(successResponse(await adminRepo.deleteCurriculumCourse(req.params.maCTDT, req.params.maMonHoc)));
  } catch (err) { next(err); }
};

const createClass = async (req, res, next) => {
  try { return res.status(201).json(successResponse(await adminRepo.createClass(req.body))); }
  catch (err) { next(err); }
};

const updateClass = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.updateClass((req.validated?.params || req.params).id, req.body))); }
  catch (err) { next(err); }
};

const deleteClass = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.deleteClass((req.validated?.params || req.params).id))); }
  catch (err) { next(err); }
};

const createClassSchedule = async (req, res, next) => {
  try { return res.status(201).json(successResponse(await adminRepo.createClassSchedule(req.params.id, req.body))); }
  catch (err) { next(err); }
};

const updateClassSchedule = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.updateClassSchedule(req.params.id, req.params.scheduleId, req.body))); }
  catch (err) { next(err); }
};

const deleteClassSchedule = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await adminRepo.deleteClassSchedule(req.params.id, req.params.scheduleId))); }
  catch (err) { next(err); }
};

const getRegistrations = async (req, res, next) => {
  try {
    const { maSV, maSinhVien, maLHP, maLop, trangThai, search, page, pageSize } = req.validated?.query || req.query;
    const result = await adminRepo.getRegistrationsList({ maSV, maSinhVien, maLHP, maLop, trangThai, search, page, pageSize });
    return res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      })
    );
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page, pageSize, limit, maTaiKhoan, tuNgay, denNgay } = req.validated?.query || req.query;
    const result = await adminRepo.getAuditLogs({ page, pageSize: pageSize || limit, maTaiKhoan, tuNgay, denNgay });
    return res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      })
    );
  } catch (err) {
    next(err);
  }
};

const createStudent = async (req, res, next) => {
  try {
    req.context = 'STUDENT_CLASS';
    const student = await adminRepo.createStudent(req.body);
    return res.status(201).json(successResponse(student));
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    req.context = 'STUDENT_CLASS';
    const { id } = req.validated?.params || req.params;
    const student = await adminRepo.updateStudent(Number(id), req.body);
    return res.status(200).json(successResponse(student));
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.validated?.params || req.params;
    const result = await adminRepo.deleteStudent(Number(id));
    return res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTuitionReport,
  getUsers,
  updateUserStatus,
  getCurriculums,
  getCurriculumOptions,
  getCurriculumPrograms,
  createCurriculumProgram, updateCurriculumProgram, deleteCurriculumProgram,
  createCurriculumCourse, updateCurriculumCourse, deleteCurriculumCourse,
  getDashboardStats,
  getStudents,
  getAllClasses,
  getClassSection,
  getLecturerOptions,
  getCourses, createCourse, updateCourse, deleteCourse,
  createClass, updateClass, deleteClass,
  createClassSchedule, updateClassSchedule, deleteClassSchedule,
  getRegistrations,
  getAuditLogs,
  createStudent,
  updateStudent,
  deleteStudent
};
