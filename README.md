# Blood Donation Management and Donor Care System

Đồ án niên luận — Hệ thống hỗ trợ quản lý hoạt động hiến máu và chăm sóc người hiến máu.

## Mở dự án trong VS Code

Mở file **`BloodDonation.code-workspace`** bằng VS Code (File → Open Workspace from File...), VS Code sẽ tự load cả 2 thư mục `backend/` và `frontend/` cùng lúc trong 1 cửa sổ, kèm gợi ý cài extension hữu ích (ESLint, Prettier, MongoDB, REST Client).

Nếu không dùng file workspace, có thể mở trực tiếp thư mục gốc này như 1 project bình thường.

## Cấu trúc

```
.
├── BloodDonation.code-workspace
├── backend/     (Tuần 3 - NodeJS + Express + MongoDB + JWT)
└── frontend/    (Tuần 4 - ReactJS + Vite + Ant Design)
```

Chi tiết cài đặt/chạy từng phần xem README.md riêng trong mỗi thư mục.

## Chạy nhanh cả 2

```bash
# Terminal 1
cd backend && npm install && npm run seed && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

Backend: http://localhost:5000 · Frontend: http://localhost:5173 (đăng nhập `central` / `123456`).

## Trạng thái tiến độ

- Tuần 2: Phân tích yêu cầu (đã duyệt).
- Tuần 3: Backend + Database (đã cài đặt, **chưa test thực tế** — cần chạy trên máy có mạng + MongoDB để xác nhận. 2 điểm cần bạn xác nhận: field bloodRequestId/assignedUnits, và việc cài sớm liên kết CCCD — xem báo cáo Tuần 3).
- Tuần 4: Frontend ReactJS (đã cài đặt trước lịch — cần bạn xác nhận có giữ hay để làm lại đúng tuần).
