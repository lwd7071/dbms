# ProjectDBMS — Hướng dẫn chạy bản hiện tại

Đây là bản hiện tại của hệ thống quản lý học vụ và đăng ký tín chỉ, gồm giao diện web, backend Node.js/Express và cơ sở dữ liệu Microsoft SQL Server. Các lệnh dưới đây dành cho Windows PowerShell.

## 1. Cài phần mềm cần thiết

- Node.js bản LTS (bao gồm npm).
- SQL Server 2022 Developer hoặc Express, đang chạy.
- SQL Server Management Studio (SSMS).
- Bật SQL Server Authentication (Mixed Mode) và TCP/IP trong SQL Server Configuration Manager; khởi động lại dịch vụ SQL Server sau khi đổi chế độ xác thực.

## 2. Tạo các SQL login

Backend dùng các login SQL riêng cho xác thực và bốn vai trò. Trước khi dựng database, nhờ người quản trị SQL Server tạo các login sau trong SSMS (Security → Logins → New Login), chọn SQL Server authentication:

| Login | Mục đích |
| --- | --- |
| `dbms_maintenance` | Dựng database và chạy các thao tác bảo trì. Cần quyền tạo database và quyền tạo đối tượng SQL; cách đơn giản cho máy demo là tạm cấp `sysadmin` trong lúc dựng DB. Không dùng login này cho backend. |
| `dbms_app` | Xác thực tài khoản ứng dụng |
| `dbms_student` | Kết nối của vai trò sinh viên |
| `dbms_lecturer` | Kết nối của vai trò giảng viên |
| `dbms_training` | Kết nối của vai trò phòng đào tạo |
| `dbms_admin` | Kết nối của vai trò quản trị viên |

Đặt mật khẩu riêng cho từng login và lưu lại để điền vào `backend/.env`. Không gửi file `.env` cho người khác. Khi các login đã tồn tại, script dựng database sẽ tự ánh xạ bốn login runtime vào các role SQL tương ứng.

## 3. Cấu hình kết nối

Mở PowerShell tại thư mục gốc đã giải nén ZIP. Tạo file cấu hình từ mẫu:

```powershell
Copy-Item backend/.env.example backend/.env
```

Sửa `backend/.env` và điền mật khẩu đã đặt. Cập nhật `DB_SERVER` nếu SQL Server không nằm trên máy này (ví dụ `localhost` hoặc tên máy\\SQLEXPRESS); giữ `DB_PORT=1433` nếu đang dùng cổng mặc định. `JWT_SECRET` cần là chuỗi bí mật ngẫu nhiên dài tối thiểu 32 ký tự.

Các giá trị phải điền gồm `DB_USER`/`DB_PASSWORD`, cặp user/password của bốn vai trò, `DB_MAINT_USER=dbms_maintenance`, `DB_MAINT_PASSWORD`, và `JWT_SECRET`. Đặt `DB_NAME=DBMS330284` để khớp với tên database trong các file SQL ở thư mục `DB`.

## 4. Cài thư viện và dựng database demo

Mở SSMS, kết nối tới SQL Server của máy và mở `DB/00_Build_DBMS330284.sql`. Chạy toàn bộ file bằng F5 để tạo database, schema, quyền và dữ liệu mẫu. **Nếu database `DBMS330284` đã tồn tại, file này sẽ xóa và tạo lại database đó, gồm toàn bộ dữ liệu. Chỉ chạy trên database demo mới hoặc sau khi đã sao lưu dữ liệu cần giữ.**

Sau khi dựng xong, mở PowerShell tại thư mục gốc project và chạy:

```powershell
cd backend
npm ci
cd ..
node backend/scripts/run_all_db_files.js --action security --database DBMS330284
node backend/scripts/run_all_db_files.js --action verify --database DBMS330284
```

`security` nạp lại các stored procedure dùng bởi backend và áp quyền cho các SQL login runtime. `verify` kiểm tra cấu trúc và dữ liệu sau khi dựng.

## 5. Chạy ứng dụng

Đảm bảo `DB_NAME` trong `backend/.env` trùng tên database vừa dựng. Từ thư mục gốc:

```powershell
cd backend
npm start
```

Giữ cửa sổ PowerShell mở. Mở trình duyệt tại [http://localhost:5000](http://localhost:5000). Có thể kiểm tra API tại [http://localhost:5000/api/health](http://localhost:5000/api/health) và kết nối database tại [http://localhost:5000/api/health/db](http://localhost:5000/api/health/db). Dừng server bằng `Ctrl+C`.

## 6. Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
| --- | --- | --- |
| Sinh viên | `sv_23000001` | `123456` |
| Giảng viên | `gv_gv0001` | `123456` |
| Phòng đào tạo | `daotao01` | `123456` |
| Quản trị viên | `admin` | `123456` |

Đây là tài khoản của dữ liệu mẫu trong database demo.

## Xử lý lỗi thường gặp

- **`Thiếu cấu hình bắt buộc`**: kiểm tra đã tạo `backend/.env`, điền đủ các biến runtime và `JWT_SECRET`.
- **Lỗi đăng nhập/kết nối SQL**: kiểm tra SQL Server đang chạy, Mixed Mode/TCP-IP đã bật, `DB_SERVER`/`DB_PORT` đúng và mật khẩu trong `.env` khớp với login.
- **Login không có quyền hoặc thiếu database user/role**: tạo đủ năm login runtime trước khi dựng DB; chạy lại `node backend/scripts/run_all_db_files.js --action security --database DBMS330284` bằng tài khoản bảo trì.
- **Không mở được website**: để `npm start` chạy, kiểm tra cổng trong `PORT` và dùng đúng địa chỉ `http://localhost:<PORT>`.
- **Không kết nối được package registry khi chạy `npm ci`**: máy cần Internet để tải thư viện theo `backend/package-lock.json`.

## Thành phần trong gói

- `backend/`: API, cấu hình mẫu, script dựng DB và mã kiểm thử.
- `frontend/`: giao diện web được backend phục vụ.
- `DB/`: schema, dữ liệu demo, quyền và kiểm tra SQL.
- `docs/`: đặc tả và thiết kế database.

Không gửi `backend/.env` cùng mã nguồn vì file này chứa thông tin đăng nhập SQL và JWT secret.
