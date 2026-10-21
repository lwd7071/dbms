# Xác minh project DBMS — 2026-10-14

## Kết quả chạy

- API kết nối thành công tới SQL Server database `DBMS330284`.
- Toàn bộ Jest suite: **26/26 suites, 173/173 tests PASS**.
- Đọc trực tiếp từ `sys.*`: **19 tables, 6 views, 7 functions, 9 stored procedures, 14 triggers, 31 nonclustered indexes**.
- Test đăng ký, ghi điểm, học phí, thanh toán chờ, CRUD sinh viên và catalog dùng fixture riêng; test dọn đúng bản ghi do nó tạo.
- CRUD môn học/lớp học phần đã được kiểm tra qua API: tạo, sửa, đọc, xóa; payload không hợp lệ và request chưa đăng nhập bị từ chối.

## Phép đo bổ sung và giới hạn còn lại

- Đã đo một truy vấn index: forced table scan **338 logical reads**, forced index seek **3 logical reads**; cả hai trả cùng **42 dòng**. Đây là phép đo một truy vấn, không đại diện cho toàn bộ 19 index nghiệp vụ.
- Đã chạy concurrency hai session SQL trên fixture riêng với lớp còn **1/1 chỗ**: phiên B chờ phiên A; sau khi A đăng ký thành công, B bị từ chối với lỗi SQL **50011**; sĩ số cuối là **1/1**. Ca này chứng minh tranh chấp một chỗ trên fixture nhỏ, không phải kịch bản 39/40 hay phản hồi HTTP 201/409.
- Chưa chạy backup/restore, `DBCC CHECKDB`, UI end-to-end hoặc kiểm chứng quyền SQL least-privilege trong lần xác minh này.
