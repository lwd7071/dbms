# SQL Server scripts

## Thứ tự triển khai

`run_all_db_files.js` tách các thao tác để tránh chạy seed/test nhầm trong lúc dựng schema. `build/seed` chỉ nhận database có tên `DBMS330284_CodexDemo` hoặc biến thể `_...`; runner không có thao tác drop và từ chối build trên DB đã có bảng. `migrate` nhận DB đích cũ và DB rehearsal được allowlist riêng.

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

Role `APP_RUNTIME` hiện đã có quyền đọc được giới hạn và quyền thực thi một số procedure. `dbms_app` chưa được provision và backend vẫn dùng cấu hình quản trị hiện có; chưa chuyển `.env` sang runtime vì một số repository còn đọc/ghi trực tiếp. Khi hoàn tất chuyển đổi, tạo login bằng mật khẩu ngẫu nhiên ngoài script SQL, đặt bí mật chỉ trong `backend/.env`, map user vào `APP_RUNTIME`, kiểm tra không là thành viên `db_owner`, `db_datareader` hay `db_datawriter`, rồi chạy toàn bộ API/test bằng principal này. Fixture phải dùng thông tin kết nối kiểm thử riêng để tạo và dọn dữ liệu; request ứng dụng phải đi qua runtime pool.

## Danh mục

- `01_CreateDatabase.sql`: tạo database khi chưa tồn tại.
- `02_CreateTables.sql` / `03_Constraints.sql`: bảng, khóa và checks.
- `04_SeedData.sql`: seed duy nhất; chỉ chấp nhận database trống và không xóa dữ liệu.
- `05_Triggers.sql`–`09_Indexes.sql`: trigger, views, functions, procedures, indexes.
- `11_Security.sql`: role, quyền và user kiểm thử. Runtime login chưa được provision; xem giới hạn trong `docs/spec.md`.
- `14_Verify.sql`: xác minh chỉ đọc.
- `tests/`: integration, role permission, invariant, transaction và concurrency. Script giao dịch/concurrency chạy riêng, không thuộc `build`.
- `Migrations/`: thay đổi bổ sung cho database đã có; cần review và chạy tường minh.

Migration được lưu tại `Migrations/20261021_CurriculumAndInvariants.sql`; runner áp dụng migration rồi nạp lại trigger, view, function, procedure, index và quyền. Backup trước migration được giữ tại thư mục Backup của SQL Server. Không đổi `--database` thành DB cũ khi chạy build/seed.
