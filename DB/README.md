# SQL Server scripts

## Dựng CSDL đầy đủ trong SSMS

Nếu chỉ lấy thư mục `DB/`, mở `00_Build_DBMS330284.sql` trong SQL Server Management Studio và chạy toàn bộ file (F5). File tự tạo database `DBMS330284`, dựng schema, phân quyền, nạp dữ liệu mẫu và chạy kiểm tra `14_Verify.sql`; không cần SQLCMD mode, Node.js, `.env` hay file nào ngoài thư mục này.

Tài khoản chạy cần quyền `CREATE DATABASE` và quyền tạo đối tượng trong database. **Mỗi lần chạy, nếu `DBMS330284` đã tồn tại, file `00` sẽ xóa toàn bộ database đó (gồm tất cả dữ liệu) rồi tạo lại.** Nếu một batch lỗi giữa chừng, các batch sau sẽ dừng an toàn; xóa database dở dang trước khi chạy lại.

Các file thành phần `.sql` cũng ghi rõ `DBMS330284` trong lệnh `USE`, nên có thể mở riêng từng file để kiểm tra hoặc chạy theo đúng thứ tự. Seed chỉ dùng cho database mới/trống; không chạy seed lặp lại trên dữ liệu đang dùng. Runner Node vẫn dùng được cho database demo và rehearsal: runner đổi tên đích `DBMS330284` thành database được truyền qua `--database`.

## Thứ tự triển khai

`run_all_db_files.js` tách các thao tác để tránh chạy seed/test nhầm trong lúc dựng schema. `build/seed` chỉ nhận database có tên `DBMS330284_CodexDemo` hoặc biến thể `_...`; runner không có thao tác drop và từ chối build trên DB đã có bảng. `migrate` nhận DB đích cũ và DB rehearsal được allowlist riêng; với `DBMS330284` phải truyền `--backup-verified YES` sau khi hoàn tất backup và restore rehearsal.

```powershell
node backend/scripts/run_all_db_files.js --action build --database DBMS330284_CodexDemo
node backend/scripts/run_all_db_files.js --action seed --database DBMS330284_CodexDemo
node backend/scripts/run_all_db_files.js --action verify --database DBMS330284_CodexDemo
node backend/scripts/run_all_db_files.js --action security --database DBMS330284_CodexDemo
node backend/scripts/run_all_db_files.js --action test --database DBMS330284_CodexDemo
```

Đối với DB nhóm `DBMS330284`, migration đã được áp dụng ngày 21/10/2026 sau khi tạo backup có checksum và restore rehearsal. Backup `DBMS330284_pre_runtime_20261021170400.bak` đã qua `RESTORE VERIFYONLY`; bản rehearsal `DBMS330284_RuntimeRehearsal_20261021` đã qua `DBCC CHECKDB`. Không chạy `build` hoặc `seed` lên DB này. Verify/test có thể chạy tường minh:

```powershell
node backend/scripts/run_all_db_files.js --action verify --database DBMS330284
node backend/scripts/run_all_db_files.js --action test --database DBMS330284
```

`build` tạo database nếu chưa có, sau đó chạy schema theo thứ tự: tables, constraints, triggers, views, functions, procedures, indexes, security. `seed`, `security`, `verify` và `test` là thao tác riêng.

Khi chuẩn bị thay đổi schema trên database có dữ liệu, hãy tạo `COPY_ONLY` backup với `CHECKSUM`, chạy `RESTORE VERIFYONLY`, khôi phục sang một database rehearsal độc lập rồi chạy `DBCC CHECKDB`. Chỉ áp dụng migration sau khi rehearsal đạt. Không dùng `build`, seed, script reset hoặc migration không liên quan trên database thật.

Backend hiện có pool riêng cho xác thực và bốn role, xác minh USER_NAME()/membership trước khi listen; các repository nghiệp vụ gọi stored procedure thay vì query bảng trực tiếp. Cần provision năm runtime login và credential bảo trì/test ngoài repository. Fixture chỉ chạy trên DB cô lập qua DB_TEST_USER; migration/build chỉ qua DB_MAINT_USER. SQL Server hiện chưa được kiểm tra lại sau khi hoàn tất chuyển đổi, nên trước demo phải chạy security, SQL/API tests và rehearsal trên DB cô lập.

## Danh mục

- `01_CreateDatabase.sql`: tạo database khi chưa tồn tại.
- `02_CreateTables.sql` / `03_Constraints.sql`: bảng, khóa và checks.
- `04_SeedData.sql`: seed duy nhất; chỉ chấp nhận database trống và không xóa dữ liệu.
- `05_Triggers.sql`–`07_Functions.sql`, `09_Indexes.sql`: trigger, views, functions, indexes.
- `08_StoredProcedures.sql`: stored procedures nghiệp vụ và phần procedure API role-based cho backend.
- `11_Security.sql`: role, membership, quyền procedure và user kiểm thử. Runtime logins phải được provision riêng.
- `14_Verify.sql`: xác minh chỉ đọc.
- `tests/`: integration, role permission, invariant, transaction và concurrency. Script giao dịch/concurrency chạy riêng, không thuộc `build`.
- `Migrations/`: thay đổi bổ sung cho database đã có; cần review và chạy tường minh.

Migration được lưu tại `Migrations/20261021_CurriculumAndInvariants.sql`; runner áp dụng migration rồi nạp lại trigger, view, function, procedure, index và quyền. Backup trước migration được giữ tại thư mục Backup của SQL Server. Không đổi `--database` thành DB cũ khi chạy build/seed.

## Runtime theo vai trò và demo từ chối quyền

Backend cần năm login SQL riêng trong `backend/.env`: `dbms_app` cho xác thực; `dbms_student`, `dbms_lecturer`, `dbms_training`, `dbms_admin` cho request theo vai trò. Các secret không lưu trong Git. Cấu hình `DB_MAINT_USER/PASSWORD` chỉ dùng runner/migration; `DB_TEST_USER/PASSWORD` chỉ dùng fixture trên DB test cô lập. Runner action `security` nạp lại phần Application API procedures ở cuối `08_StoredProcedures.sql` rồi áp quyền trong `11_Security.sql`.

Demo trên DB rehearsal: `REVOKE EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty FROM QUAN_TRI;`, thử xóa khoa bằng admin UI (API trả 403, bản ghi vẫn còn), rồi `GRANT EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty TO QUAN_TRI;` và thử lại. Không demo bằng cách xóa quyền trên DB có dữ liệu thật.
