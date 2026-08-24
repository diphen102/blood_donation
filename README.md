# Blood Donation Management and Donor Care System

Đồ án niên luận — Hệ thống hỗ trợ quản lý hoạt động hiến máu và chăm sóc người hiến máu.

## Mở dự án trong VS Code

Mở file **`BloodDonation.code-workspace`** bằng VS Code (File → Open Workspace from File...), VS Code sẽ tự load cả 2 thư mục `backend/` và `frontend/` cùng lúc trong 1 cửa sổ, kèm gợi ý cài extension hữu ích (ESLint, Prettier, MongoDB, REST Client).

Nếu không dùng file workspace, có thể mở trực tiếp thư mục gốc này như 1 project bình thường.

## Cấu trúc

```
.
├── BloodDonation.code-workspace
├── backend/     (NodeJS + Express + MongoDB + JWT)
└── frontend/    (ReactJS + Vite + Ant Design)
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

## Cập nhật gần nhất (sau review)

- **Đổi mật khẩu tự phục vụ**: `PUT /api/auth/change-password` — mọi role tự đổi mật khẩu của mình, tách biệt với chức năng ADMIN reset mật khẩu tạm cho người khác đã có sẵn.
- **Tách tồn kho theo loại chế phẩm hiến máu** (Toàn phần / Tiểu cầu / Huyết tương): `BloodUnit` nay có field `donationType` (denormalize từ `Donation.donationType`, giống cách `bloodGroup` đã denormalize từ `Donor`). `GET /blood-units/summary` trả về dạng lồng `{bloodGroup: {donationType: {status: count}}}` thay vì gộp chung theo nhóm máu. Nếu đã có dữ liệu cũ trong MongoDB, chạy `npm run backfill:donation-type` ở `backend/` một lần để vá field này cho các BloodUnit tạo trước thay đổi.

## Trạng thái tiến độ

- Backend + Database: đã cài đặt.
- Frontend ReactJS: đã cài đặt.
- Cần tự chạy trên máy có mạng + MongoDB để test thực tế và chụp ảnh màn hình cho báo cáo.
