/**
 * Translation Layer: Ánh xạ mã lỗi SQL Server sang HTTP status và thông báo tiếng Việt
 * Khớp 100% với 05_Triggers.sql, 08_StoredProcedures.sql và spec.md
 */

const SQL_ERROR_MAP = {
  // SP_DangKyTinChi
  50001: { status: 404, field: 'maSV', message: 'Sinh viên không tồn tại trong hệ thống.' },
  50002: { status: 409, field: 'maSV', message: 'Sinh viên không ở trạng thái Đang học (có thể đang Bảo lưu hoặc Thôi học).' },
  50003: { status: 403, field: 'taiKhoan', message: 'Tài khoản sinh viên hiện đang bị khóa hoặc vô hiệu hóa.' },
  50004: { status: 404, field: 'maLHP', message: 'Lớp học phần không tồn tại trong hệ thống.' },
  50005: { status: 409, field: 'maLHP', message: 'Lớp học phần hiện không mở đăng ký.' },
  50006: { status: 409, field: 'thoiGian', message: 'Hiện không nằm trong khoảng thời gian mở đăng ký tín chỉ của học kỳ.' },
  50007: { status: 409, field: 'maMonHoc', message: 'Sinh viên đã đăng ký môn học này trong học kỳ hiện tại.' },
  50008: { status: 409, field: 'tienQuyet', message: 'Sinh viên chưa hoàn thành môn tiên quyết bắt buộc của môn học này.' },
  50009: { status: 409, field: 'lichHoc', message: 'Lịch học của lớp này bị trùng với thời khóa biểu đã đăng ký của bạn.' },
  50010: { status: 409, field: 'tinChi', message: 'Vượt quá số tín chỉ tối đa được phép đăng ký trong học kỳ.' },
  50011: { status: 409, field: 'siSo', message: 'Lớp học phần đã đủ sĩ số tối đa (hết chỗ).' },
  50030: { status: 400, field: 'maDangKy', message: 'Một sinh viên trong danh sách gửi lên không thuộc lớp học phần này hoặc đăng ký đã bị hủy.' },

  // SP_HuyDangKy
  50021: { status: 404, field: 'maDangKy', message: 'Không tìm thấy đăng ký học phần hợp lệ để hủy.' },
  50022: { status: 409, field: 'thoiGian', message: 'Đã hết thời hạn đăng ký hoặc hủy học phần trong học kỳ.' },
  50023: { status: 409, field: 'diemSo', message: 'Không thể hủy học phần vì sinh viên đã có điểm thành phần trong hệ thống.' },

  // SP_TinhHocPhiSinhVien
  50014: { status: 409, field: 'hocPhi', message: 'Sinh viên đã có hồ sơ học phí trong học kỳ này.' },
  50017: { status: 409, field: 'tinChi', message: 'Sinh viên không có tín chỉ hợp lệ nào trong học kỳ để tính học phí.' },

  // Triggers
  51001: { status: 409, field: 'chuTrinh', message: 'Không thể thiết lập môn tiên quyết do tạo thành chu trình phụ thuộc vòng lặp.' },
  51002: { status: 409, field: 'siSo', message: 'Lớp học phần đã đạt ngưỡng sĩ số tối đa cho phép.' },
  51007: { status: 409, field: 'maLop', message: 'Không thể xóa lớp sinh hoạt đang có sinh viên trực thuộc.' },
  51008: { status: 404, field: 'maLop', message: 'Không tìm thấy lớp sinh hoạt được yêu cầu.' },
  51310: { status: 409, field: 'phongHoc', message: 'Lịch học bị trùng giảng viên hoặc trùng phòng học trong cùng khung giờ.' },
  51311: { status: 409, field: 'lichHoc', message: 'Lớp học phần phải có ít nhất một lịch hợp lệ trước khi mở đăng ký.' },

  // SP_KhoaTaiKhoan
  51010: { status: 404, field: 'maTaiKhoan', message: 'Không tìm thấy tài khoản người dùng cần thao tác.' },
  51012: { status: 403, field: 'permission', message: 'Tài khoản hiện tại không có quyền thực hiện thao tác này.' },
  51014: { status: 403, field: 'permission', message: 'Phòng Đào tạo không được thay đổi trạng thái tài khoản quản trị.' },
  51015: { status: 409, field: 'username', message: 'Không thể tự khóa tài khoản đang đăng nhập.' },

  // SP_XacNhanThanhToan & SP_TuChoiThanhToan
  51401: { status: 404, field: 'maThanhToan', message: 'Giao dịch thanh toán không tồn tại trong hệ thống.' },
  51402: { status: 409, field: 'trangThai', message: 'Giao dịch thanh toán đã được xác nhận trước đó.' },
  51403: { status: 409, field: 'trangThai', message: 'Không thể xác nhận giao dịch thanh toán đã bị từ chối.' },
  51404: { status: 403, field: 'taiKhoan', message: 'Tài khoản không có quyền xác nhận hoặc từ chối thanh toán.' },
  51405: { status: 409, field: 'trangThai', message: 'Chỉ có thể thao tác với giao dịch đang ở trạng thái chờ xác nhận.' }
};

/**
 * Map SQL Server error sang cấu trúc chuẩn cho API
 * @param {Error} error - Đối tượng lỗi bắt được từ try-catch
 * @param {string} context - Ngữ cảnh thực thi (VD: 'PAYMENT', 'CREATE_USER', 'REGISTRATION')
 */
const mapSqlError = (error, context = '') => {
  const errorNumber = error.number;

  // Xử lý riêng mã lỗi 51006 dựa theo ngữ cảnh
  if (errorNumber === 51006) {
    if (context === 'CREATE_USER') {
      return {
        status: 409,
        field: 'username',
        message: 'Tên đăng nhập đã tồn tại trong hệ thống.'
      };
    }
    // Mặc định cho context PAYMENT hoặc trigger cập nhật học phí
    return {
      status: 409,
      field: 'soTien',
      message: 'Tổng số tiền thanh toán không được vượt quá số dư học phí còn lại.'
    };
  }

  if (errorNumber === 51008 && context === 'STUDENT_CLASS') {
    return {
      status: 422,
      field: 'maCTDT',
      message: 'Khoa và khóa tuyển sinh của sinh viên phải khớp với lớp và chương trình đào tạo.'
    };
  }

  // Tra cứu bảng map chuẩn
  if (SQL_ERROR_MAP[errorNumber]) {
    return SQL_ERROR_MAP[errorNumber];
  }

  // Lỗi ràng buộc CHECK CONSTRAINT hoặc Khóa ngoại (547)
  if (errorNumber === 547) {
    if (context === 'PAYMENT' || (error.message && error.message.includes('CK_HOCPHI'))) {
      return {
        status: 409,
        field: 'soTien',
        message: 'Tổng số tiền thanh toán không được vượt quá số dư học phí còn lại.'
      };
    }
    return {
      status: 409,
      field: 'foreignKey',
      message: 'Thông tin liên quan không còn tồn tại hoặc không phù hợp. Vui lòng kiểm tra lại.'
    };
  }

  // Lỗi trùng lặp khóa chính / UNIQUE (Unique constraint violation)
  if (errorNumber === 2627 || errorNumber === 2601) {
    return {
      status: 409,
      field: 'unique',
      message: 'Thông tin này đã được sử dụng. Vui lòng kiểm tra lại.'
    };
  }

  // Lỗi không xác định khác
  return {
    status: 500,
    field: 'database',
    message: 'Đã xảy ra lỗi khi xử lý dữ liệu. Vui lòng thử lại hoặc liên hệ quản trị viên.'
  };
};

module.exports = {
  mapSqlError
};
