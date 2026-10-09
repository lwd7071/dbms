# AGENT.md

## 1. General Rules

- Đọc `spec.md` trước khi thực hiện task.
- Tuân thủ kiến trúc, API contract, database schema và coding conventions trong `spec.md`.
- Không tự ý thay đổi scope, kiến trúc hoặc thiết kế nếu chưa được yêu cầu.
- Ưu tiên sửa ít file nhất có thể và không phá vỡ chức năng hiện có.
- Không coi task là hoàn thành nếu chưa kiểm tra/verify.

## 2. Task Workflow

Luôn thực hiện:

1. Đọc `spec.md` và code liên quan.
2. Implement task.
3. Run test / verify kết quả.
4. Fix lỗi nếu có.
5. Cập nhật `Task.md`.
6. Báo cáo ngắn gọn cho user.

## 3. Task.md — REQUIRED

Sau mỗi task, **bắt buộc cập nhật `Task.md`**.

Mỗi task ghi:

```md
## [Task Name]

- Status: DONE / IN PROGRESS / BLOCKED
- Date:
- Files changed:
  - `file1`
  - `file2`

### Changes
- Đã làm gì.

### Tests / Verification
- Test nào đã chạy.
- Kết quả PASS / FAIL.

### Issues
- Vấn đề còn lại hoặc `None`.

### Next Step
- Bước tiếp theo.