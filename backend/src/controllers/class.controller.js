const classService = require('../services/class.service');
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
  }
};

module.exports = classController;
