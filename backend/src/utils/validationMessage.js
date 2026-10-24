const FIELD_LABELS = {
  id: 'Mã hồ sơ',
  username: 'Tên đăng nhập',
  password: 'Mật khẩu',
  vaiTro: 'Vai trò tài khoản',
  trangThai: 'Trạng thái',
  page: 'Số trang',
  pageSize: 'Số lượng mỗi trang',
  limit: 'Số lượng bản ghi',
  search: 'Từ khóa tìm kiếm',
  maSV: 'Mã sinh viên',
  maSinhVien: 'Mã sinh viên',
  hoTen: 'Họ tên',
  ngaySinh: 'Ngày sinh',
  email: 'Email',
  soDienThoai: 'Số điện thoại',
  maKhoa: 'Khoa',
  maCTDT: 'Chương trình đào tạo',
  maLop: 'Lớp sinh hoạt',
  maLHP: 'Lớp học phần',
  maMonHoc: 'Môn học',
  tenMonHoc: 'Tên môn học',
  soTinChi: 'Số tín chỉ',
  soTietLyThuyet: 'Số tiết lý thuyết',
  soTietThucHanh: 'Số tiết thực hành',
  maHocKy: 'Học kỳ',
  namTuyenSinh: 'Năm tuyển sinh',
  hocKyDuKien: 'Học kỳ dự kiến',
  maGiangVien: 'Giảng viên',
  tenLHP: 'Tên lớp học phần',
  soLuongToiDa: 'Sĩ số tối đa',
  maDangKy: 'Mã đăng ký học phần',
  grades: 'Bảng điểm',
  diemQuaTrinh: 'Điểm quá trình',
  diemGiuaKy: 'Điểm giữa kỳ',
  diemCuoiKy: 'Điểm cuối kỳ',
  maHocPhi: 'Hồ sơ học phí',
  soTien: 'Số tiền thanh toán',
  phuongThuc: 'Phương thức thanh toán',
  type: 'Loại tra cứu',
  foreignKey: 'Dữ liệu liên quan',
  unique: 'Thông tin'
};

const labelForPath = (path, source) => {
  const key = [...(path || [])].reverse().find(part => typeof part === 'string');
  return FIELD_LABELS[key] || (source === 'query' ? 'Điều kiện tìm kiếm' : 'Thông tin gửi lên');
};

const isVietnameseMessage = message => /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(message)
  || /\b(phải|không|vui lòng|là|được|cần|tối đa|tối thiểu|bắt buộc|hợp lệ|định dạng|trùng|rỗng)\b/i.test(message);

const validationMessage = (issue, source) => {
  const label = labelForPath(issue.path, source);
  const original = typeof issue.message === 'string' ? issue.message.trim() : '';

  // Preserve Vietnamese, field-specific messages already written in schemas.
  if (original && isVietnameseMessage(original)) return original;

  switch (issue.code) {
    case 'invalid_value':
      return `${label} không hợp lệ. Vui lòng chọn một giá trị trong danh sách.`;
    case 'invalid_type':
      if (issue.received === 'NaN' || issue.input !== undefined) {
        if (label === 'Số lượng mỗi trang') return 'Số lượng mỗi trang phải là số hợp lệ.';
        if (label === 'Số trang') return 'Số trang phải là số hợp lệ.';
        return `${label} chưa đúng định dạng.`;
      }
      if (issue.input === undefined) return `${label} là bắt buộc.`;
      if (label === 'Số lượng mỗi trang') return 'Số lượng mỗi trang phải là số hợp lệ.';
      if (label === 'Số trang') return 'Số trang phải là số hợp lệ.';
      return `${label} chưa đúng định dạng.`;
    case 'too_small':
      if (issue.origin === 'string') return `${label} cần có ít nhất ${issue.minimum} ký tự.`;
      if (issue.origin === 'array') return `${label} cần có ít nhất ${issue.minimum} mục.`;
      if (issue.inclusive === false) return `${label} phải lớn hơn ${issue.minimum}.`;
      return `${label} phải từ ${issue.minimum} trở lên.`;
    case 'too_big':
      if (issue.origin === 'string') return `${label} không được dài quá ${issue.maximum} ký tự.`;
      if (issue.origin === 'array') return `${label} không được có quá ${issue.maximum} mục.`;
      return `${label} không được lớn hơn ${issue.maximum}.`;
    case 'invalid_format':
      return `${label} chưa đúng định dạng. Vui lòng kiểm tra lại.`;
    case 'unrecognized_keys':
      return 'Yêu cầu có thông tin không được hỗ trợ. Vui lòng kiểm tra lại dữ liệu.';
    default:
      return `${label} chưa hợp lệ. Vui lòng kiểm tra lại thông tin.`;
  }
};

module.exports = { validationMessage };
