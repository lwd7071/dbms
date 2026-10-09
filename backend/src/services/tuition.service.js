const tuitionRepo = require('../repositories/tuition.repository');

/**
 * Service xử lý thanh toán học phí, xác nhận thanh toán và báo cáo tài chính
 */
const processPayment = async ({ maHocPhi, soTien, phuongThuc }) => {
  return await tuitionRepo.createPayment(maHocPhi, soTien, phuongThuc);
};

const confirmPayment = async (maThanhToan, maTaiKhoanXacNhan) => {
  return await tuitionRepo.confirmPayment(Number(maThanhToan), Number(maTaiKhoanXacNhan));
};

const rejectPayment = async (maThanhToan, maTaiKhoanXacNhan) => {
  return await tuitionRepo.rejectPayment(Number(maThanhToan), Number(maTaiKhoanXacNhan));
};

const getPendingPayments = async (filters = {}) => {
  return await tuitionRepo.getPendingPayments(filters);
};

const getTuitionReport = async (filters = {}) => {
  const { maHocKy, trangThai } = filters;
  return await tuitionRepo.getTuitionReport(
    maHocKy ? Number(maHocKy) : null,
    trangThai || null
  );
};

module.exports = {
  processPayment,
  confirmPayment,
  rejectPayment,
  getPendingPayments,
  getTuitionReport
};
