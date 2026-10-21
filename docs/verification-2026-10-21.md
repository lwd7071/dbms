# Báo cáo xác minh Tiêu chí 5 — 2026-10-21

## Phạm vi và dữ liệu

- Database mục tiêu: `DBMS330284` trên SQL Server local.
- Không chạy lệnh reset. Migration trước đó được diễn tập riêng trước khi áp dụng.
- Backup trước migration: `DBMS330284_pre_runtime_20261021170400.bak`, tạo với `COPY_ONLY` và `CHECKSUM`.
- `RESTORE VERIFYONLY WITH CHECKSUM`: đạt.
- Restore rehearsal sang `DBMS330284_RuntimeRehearsal_20261021`: đạt.
- `DBCC CHECKDB WITH NO_INFOMSGS` trên rehearsal: đạt.

## Kết quả kiểm thử

- Jest: **34 suites, 221 tests PASS** trên SQL Server thật và database `DBMS330284`.
- SQL integration, verify, role permission và invariant rejection: PASS qua `run_all_db_files.js --action test`.
- HTTP phân quyền audit: tài khoản `DAO_TAO` gọi `/api/admin/audit-logs` nhận 403; `QUAN_TRI` vẫn đọc được theo test hiện có.
- HTTP concurrency thanh toán: hai request đồng thời cho cùng một hồ sơ tạo đúng một giao dịch chờ; request còn lại nhận 409.
- Runtime test principal: bị từ chối đọc trực tiếp `dbo.TAIKHOAN` và ghi trực tiếp `dbo.HOCPHI`.
- Điều hướng admin: test DOM xác nhận ẩn nhật ký với `DAO_TAO`, hiện với `QUAN_TRI`; dropdown có trạng thái expanded, Escape đóng và trả focus về nút.
- Đo trang đầu danh sách tài khoản: 25 dòng; 15 logical reads trên `TAIKHOAN`; SQL CPU 0 ms, elapsed 2 ms; nhận được execution plan. Đây là một phép đo đơn lẻ, chưa đại diện workload khác.

## Hạn chế còn lại

- Backend vẫn kết nối SQL Server bằng `sa`/`dbo`. Login `dbms_app` chưa provision và toàn bộ API chưa được chạy bằng role `APP_RUNTIME`.
- Một số repository còn đọc/ghi bảng trực tiếp, bao gồm luồng cập nhật điểm, thanh toán và CRUD tài khoản/sinh viên. Chưa được chuyển vì cần test từng API và thay các thao tác ghi bằng stored procedure; chuyển pool khi chưa sửa sẽ làm luồng hiện tại lỗi.
- Chưa có HTTP concurrency test cho tranh chấp chỗ cuối lớp, hai cán bộ xác nhận cùng một giao dịch, hoặc rollback batch điểm qua runtime.
- Chưa thực hiện browser end-to-end, keyboard-only và viewport 375px trong lượt này.
- Chưa đo workload database rộng hoặc đưa ra kết luận hiệu năng toàn hệ thống.

## Lệnh kiểm tra đã chạy

```text
npm test
node scripts/run_all_db_files.js --action verify --database DBMS330284
node scripts/run_all_db_files.js --action test --database DBMS330284
```

## Đánh giá

Kết quả xác nhận kết nối database, migration có rehearsal, kiểm thử nghiệp vụ hiện có, một kịch bản thanh toán đồng thời và quyền audit UI/API. Chưa đạt điều kiện nghiệm thu đầy đủ của mục tiêu 9,5/10 vì backend chưa chạy bằng login ít quyền và chưa có đủ concurrency/browser evidence. Không nên ghi nhận runtime least privilege là hoàn tất cho tới khi hoàn thành các mục hạn chế trên.
