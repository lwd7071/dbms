const fs = require('fs');
const path = require('path');

describe('Table Typography & Anti-Awkward Wrapping (TDD & UI/UX Pro Max)', () => {
  const stylesPath = path.resolve(__dirname, '../../frontend/css/styles.css');
  const adminJsPath = path.resolve(__dirname, '../../frontend/js/admin.js');
  const registrationJsPath = path.resolve(__dirname, '../../frontend/js/registration.js');
  const tuitionJsPath = path.resolve(__dirname, '../../frontend/js/tuition.js');
  const studentJsPath = path.resolve(__dirname, '../../frontend/js/student.js');

  const stylesCss = fs.readFileSync(stylesPath, 'utf8');
  const adminJs = fs.readFileSync(adminJsPath, 'utf8');
  const registrationJs = fs.readFileSync(registrationJsPath, 'utf8');
  const tuitionJs = fs.readFileSync(tuitionJsPath, 'utf8');
  const studentJs = fs.readFileSync(studentJsPath, 'utf8');

  describe('Lát cắt 1: CSS Quy chuẩn Chống Rớt Dòng Nhảm (.badge, .btn, .cell-nowrap)', () => {
    test('thẻ .badge và .status-badge phải có white-space: nowrap để không bị bẻ chữ (như "Đang \\n học")', () => {
      expect(stylesCss).toMatch(/\.badge\s*\{[^}]*white-space:\s*nowrap/);
    });

    test('nút .btn phải có white-space: nowrap để không bị bẻ đôi nút bấm (như "Chi tiết & \\n Học phí")', () => {
      expect(stylesCss).toMatch(/\.btn\s*\{[^}]*white-space:\s*nowrap/);
    });

    test('định nghĩa class tiện ích .cell-nowrap để bảo toàn hiển thị Họ tên, Mã định danh, Thời gian', () => {
      expect(stylesCss).toContain('.cell-nowrap');
      expect(stylesCss).toMatch(/\.cell-nowrap\s*\{[^}]*white-space:\s*nowrap/);
    });
  });

  describe('Lát cắt 2: Bảng Sinh viên Admin (Chống bẻ tên người, rớt chữ lớp, rớt chữ khoa)', () => {
    test('bảng admin student table có min-width hợp lý trong table-responsive để không bị bóp nghẹt cột', () => {
      expect(adminJs).toMatch(/table[^>]*style="[^"]*min-width:\s*(?:1000px|1050px|1100px)/);
    });

    test('các cột Họ và tên, Mã SV, Lớp sinh hoạt, Khoa, SĐT, Trạng thái sử dụng class cell-nowrap', () => {
      expect(adminJs).toContain('class="cell-nowrap"');
    });
  });

  describe('Lát cắt 3: Bảng Đăng ký tín chỉ, Lớp học phần, Tài khoản người dùng Admin', () => {
    test('bảng lớp học phần có min-width để các cột Lịch học & Sĩ số không vỡ dòng', () => {
      expect(adminJs).toMatch(/loadAdminClasses[\s\S]*?min-width:\s*\d{3,4}px/);
    });

    test('bảng đăng ký tín chỉ có min-width và cell-nowrap cho sinh viên & môn học', () => {
      expect(adminJs).toMatch(/loadAdminRegistrations[\s\S]*?min-width:\s*\d{3,4}px/);
    });

    test('bảng tài khoản người dùng có min-width và cell-nowrap cho username, vai trò, trạng thái', () => {
      expect(adminJs).toMatch(/loadAdminUsers[\s\S]*?min-width:\s*\d{3,4}px/);
    });
  });

  describe('Lát cắt 4: Portal Sinh viên & Tra cứu học phí (registration.js, tuition.js, student.js)', () => {
    test('bảng môn học mở đăng ký và môn đã đăng ký có min-width và cell-nowrap', () => {
      expect(registrationJs).toMatch(/min-width:\s*\d{3,4}px/);
      expect(registrationJs).toContain('cell-nowrap');
    });

    test('tuition.js không còn chuỗi tiếng Anh PENDING mà dùng tiếng Việt có dấu Chờ duyệt', () => {
      expect(tuitionJs).not.toMatch(/Trạng thái:\s*PENDING/i);
      expect(tuitionJs).toContain('Trạng thái: Chờ duyệt');
    });

    test('bảng lịch sử thanh toán sinh viên có min-width và cell-nowrap', () => {
      expect(tuitionJs).toMatch(/min-width:\s*\d{3,4}px/);
      expect(tuitionJs).toContain('cell-nowrap');
    });
  });
});
