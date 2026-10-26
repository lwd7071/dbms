# Hướng dẫn dựng CSDL

Chọn **một** trong hai cách sau. Cả hai tạo CSDL `DBMS330284` với dữ liệu mẫu và phân quyền.

## Cách 1: Chạy file tổng hợp

1. Mở SQL Server Management Studio (SSMS) và kết nối SQL Server.
2. Mở `00_Build_DBMS330284.sql` rồi nhấn **F5**.

**Lưu ý:** File này xóa và tạo lại `DBMS330284`. Toàn bộ dữ liệu cũ sẽ mất.

## Cách 2: Chạy từng file

Trên CSDL mới/trống, mở và chạy lần lượt:

`01_CreateDatabase.sql` → `02_CreateTables.sql` → `03_Constraints.sql` → `04_SeedData.sql` → `05_Triggers.sql` → `06_Views.sql` → `07_Functions.sql` → `08_StoredProcedures.sql` → `09_Indexes.sql` → `11_Security.sql`

Thư mục hiện không có file `10`. Sau khi hoàn tất, có thể chạy `14_Verify.sql` để kiểm tra.

**Lưu ý:** Cách này chỉ dùng cho CSDL mới/trống; không chạy các file thành phần lên CSDL đang có dữ liệu.