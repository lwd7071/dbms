const classRepository = require('../repositories/class.repository');

const classService = {
  async getClasses(filters) {
    return await classRepository.findAll(filters);
  },

  async getClassDetail(maLop) {
    const classDetail = await classRepository.findById(maLop);
    if (!classDetail) {
      const err = new Error('Lớp sinh hoạt không tồn tại');
      err.status = 404;
      err.field = 'maLop';
      throw err;
    }
    return classDetail;
  },

  async getClassTuitionReport(maLop, maHocKy) {
    const report = await classRepository.getTuitionReport(maLop, maHocKy);
    if (!report) {
      const err = new Error('Lớp sinh hoạt không tồn tại');
      err.status = 404;
      err.field = 'maLop';
      throw err;
    }
    return report;
  }
};

module.exports = classService;
