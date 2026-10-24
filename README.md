# Hướng dẫn chạy ProjectDBMS

Dự án quản lý đào tạo và đăng ký tín chỉ, gồm giao diện web, API Node.js và cơ sở dữ liệu Microsoft SQL Server.

## 1. Chuẩn bị

Cài đặt trên máy:

- Node.js và npm.
- Microsoft SQL Server (project được xây dựng với SQL Server 2022), đang chạy và cho phép kết nối TCP/IP.
- Một tài khoản SQL Server có quyền tạo database để dựng dữ liệu demo.

Mở thư mục `ProjectDBMS` trong VS Code hoặc mở PowerShell tại thư mục này. Các lệnh bên dưới chạy từ thư mục gốc project.

## 2. Cấu hình kết nối SQL Server

Tạo file cấu hình riêng từ file mẫu:

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Mở `backend/.env` và điền thông tin SQL Server của máy cô vào `DB_SERVER`, `DB_PORT`, `DB_USER` và `DB_PASSWORD`. Đặt `DB_NAME=DBMS330284_CodexDemo`; tạo một `JWT_SECRET` riêng, tối thiểu 32 ký tự. File `.env` chứa mật khẩu nên không gửi lên Git.

Ví dụ SQL Server cục bộ dùng cổng mặc định:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=DBMS330284_CodexDemo
DB_USER=ten_tai_khoan_sql
DB_PASSWORD=mat_khau_sql
PORT=5000
NODE_ENV=development
JWT_SECRET=thay_bang_chuoi_bi_mat_rieng_tu_32_ky_tu_tro_len
JWT_EXPIRES_IN=24h
```

Tài khoản SQL dùng lúc dựng dữ liệu cần quyền tạo database. Nếu SQL Server cài theo named instance hoặc dùng cổng khác, cập nhật `DB_SERVER` và `DB_PORT` theo cấu hình trên máy.

## 3. Cài thư viện và tạo dữ liệu demo

Mở PowerShell tại thư mục gốc project, chạy lần lượt:

```powershell
cd backend
npm install
cd ..
node backend/scripts/run_all_db_files.js --action build --database DBMS330284_CodexDemo
node backend/scripts/run_all_db_files.js --action seed --database DBMS330284_CodexDemo
```

Hai lệnh SQL tạo cấu trúc và nạp dữ liệu mẫu vào database demo riêng. Có thể kiểm tra dữ liệu sau khi nạp:

```powershell
node backend/scripts/run_all_db_files.js --action verify --database DBMS330284_CodexDemo
```

Nếu database demo đã có bảng, lệnh `build` sẽ dừng để tránh ghi đè; `seed` cũng chỉ chạy trên database chưa có dữ liệu. Không đổi tên database trong các lệnh thành `DBMS330284` hoặc database đang có dữ liệu của nhóm.

## 4. Khởi động và mở website

Đảm bảo `DB_NAME` trong `backend/.env` đang là `DBMS330284_CodexDemo`, sau đó chạy:

```powershell
cd backend
npm start
```

Giữ cửa sổ terminal này mở trong lúc demo. Mở trình duyệt tại [http://localhost:5000](http://localhost:5000). API kiểm tra trạng thái ở [http://localhost:5000/api/health](http://localhost:5000/api/health), kiểm tra kết nối database ở [http://localhost:5000/api/health/db](http://localhost:5000/api/health/db).

## 5. Tài khoản demo

Tại trang đăng nhập, chọn một tài khoản có sẵn hoặc nhập:

| Vai trò | Tên đăng nhập | Mật khẩu |
| --- | --- | --- |
| Sinh viên | `sv_23000001` | `123456` |
| Giảng viên | `gv_gv0001` | `123456` |
| Phòng đào tạo | `daotao01` | `123456` |
| Quản trị viên | `admin` | `123456` |

Đây là thông tin đăng nhập dùng riêng cho dữ liệu demo của đồ án.

## 6. Tài liệu trong project

- [`docs/spec.md`](docs/spec.md): đặc tả hệ thống và cấu trúc project.
- [`DB/README.md`](DB/README.md): hướng dẫn chi tiết các script SQL.
- [`DB/database-design.md`](DB/database-design.md): thiết kế cơ sở dữ liệu.
- [`sodo/index.html`](sodo/index.html): sơ đồ ERD tương tác; mở file này bằng trình duyệt.
- [`DANH_SACH_TAI_KHOAN_TEST.md`](DANH_SACH_TAI_KHOAN_TEST.md): danh sách tài khoản mẫu.

## Xử lý nhanh khi không chạy được

- **Lỗi kết nối database:** kiểm tra SQL Server đang chạy, TCP/IP/cổng kết nối, và giá trị `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` trong `backend/.env`.
- **Thiếu cấu hình:** kiểm tra đã tạo `backend/.env` và điền `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.
- **Không mở được trang:** kiểm tra backend còn chạy trong terminal và truy cập đúng `http://localhost:5000`.
- **Cổng 5000 đang được sử dụng:** đổi `PORT` trong `backend/.env`, rồi mở `http://localhost:<cổng_mới>`.
