const facultyRepository = require('../repositories/faculty.repository');
const { successResponse } = require('../utils/apiResponse');

const createFaculty = async (req, res, next) => {
  try { return res.status(201).json(successResponse(await facultyRepository.createFaculty(req.dbPool, req.body))); }
  catch (err) { req.context = 'FACULTY'; next(err); }
};
const updateFaculty = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await facultyRepository.updateFaculty(req.dbPool, req.validated?.params?.id || req.params.id, req.body))); }
  catch (err) { req.context = 'FACULTY'; next(err); }
};
const deleteFaculty = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await facultyRepository.deleteFaculty(req.dbPool, req.validated?.params?.id || req.params.id))); }
  catch (err) { req.context = 'FACULTY_DELETE'; next(err); }
};
const createMajor = async (req, res, next) => {
  try { return res.status(201).json(successResponse(await facultyRepository.createMajor(req.dbPool, req.body))); }
  catch (err) { req.context = 'MAJOR'; next(err); }
};
const updateMajor = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await facultyRepository.updateMajor(req.dbPool, req.validated?.params?.id || req.params.id, req.body))); }
  catch (err) { req.context = 'MAJOR'; next(err); }
};
const deleteMajor = async (req, res, next) => {
  try { return res.status(200).json(successResponse(await facultyRepository.deleteMajor(req.dbPool, req.validated?.params?.id || req.params.id))); }
  catch (err) { req.context = 'MAJOR_DELETE'; next(err); }
};

/**
 * Lấy danh sách toàn bộ các khoa
 */
const getFaculties = async (req, res, next) => {
  try {
    const faculties = await facultyRepository.getAllFaculties(req.dbPool);
    return res.status(200).json(successResponse(faculties));
  } catch (err) {
    next(err);
  }
};

const getFacultiesForStaff = async (req, res, next) => {
  try {
    const faculties = await facultyRepository.getAllFacultiesForStaff(req.dbPool);
    return res.status(200).json(successResponse(faculties));
  } catch (err) {
    next(err);
  }
};

const getMajorsForStaff = async (req, res, next) => {
  try {
    const majors = await facultyRepository.getMajorsForStaff(req.dbPool, req.validated?.query || req.query);
    return res.status(200).json(successResponse(majors));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFaculties,
  getFacultiesForStaff,
  getMajorsForStaff,
  createFaculty, updateFaculty, deleteFaculty,
  createMajor, updateMajor, deleteMajor
};
