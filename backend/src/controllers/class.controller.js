const classService = require('../services/class.service');
const classRepository = require('../repositories/class.repository');
const { successResponse } = require('../utils/apiResponse');

const classController = {
  async getAll(req, res, next) {
    try {
      const { maKhoa, namNhapHoc } = req.query;
      const data = await classService.getClasses({ maKhoa, namNhapHoc });
      return res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  },

  async getDetail(req, res, next) {
    try {
      const { id } = req.params;
      const data = await classService.getClassDetail(id);
      return res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  },

  async getTuitionReport(req, res, next) {
    try {
      const { id } = req.params;
      const { maHocKy } = req.query;
      const data = await classService.getClassTuitionReport(id, maHocKy);
      return res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  },

  async createHomeroomClass(req, res, next) {
    try { return res.status(201).json(successResponse(await classRepository.createHomeroomClass(req.body))); }
    catch (err) { req.context = 'HOMEROOM_CLASS'; next(err); }
  },

  async updateHomeroomClass(req, res, next) {
    try { return res.status(200).json(successResponse(await classRepository.updateHomeroomClass(req.params.id, req.body))); }
    catch (err) { req.context = 'HOMEROOM_CLASS'; next(err); }
  },

  async deleteHomeroomClass(req, res, next) {
    try { return res.status(200).json(successResponse(await classRepository.deleteHomeroomClass(req.params.id))); }
    catch (err) { req.context = 'HOMEROOM_CLASS_DELETE'; next(err); }
  }
};

module.exports = classController;
