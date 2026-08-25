# 🩸 Blood Donation Management System

Hệ thống hỗ trợ quản lý hoạt động hiến máu và kết nối người hiến máu, xây dựng cho **Bệnh viện Trung ương Huế** và mạng lưới bệnh viện tuyến dưới.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)

## Giới thiệu

Hệ thống kết nối 4 nhóm người dùng trong quy trình hiến máu và điều phối máu:

- **DONOR** — người hiến máu: đăng ký/liên kết CCCD, tra cứu lịch sử hiến máu và hành trình túi máu, nhận thông báo.
- **CENTRAL** — Bệnh viện Trung ương Huế: ghi nhận lượt hiến, quản lý xét nghiệm & kho máu, duyệt và điều phối yêu cầu cấp phát (thuật toán FIFO theo hạn dùng).
- **HOSPITAL** — bệnh viện tuyến dưới: gửi yêu cầu cấp phát máu, xác nhận nhận, đánh dấu sử dụng/huỷ đơn vị máu.
- **ADMIN** — quản trị tài khoản và phân quyền hệ thống.

## Kiến trúc

```
.
├── backend/     Node.js · Express · MongoDB (Mongoose) · JWT
└── frontend/    React · Vite · Ant Design
```

Client giao tiếp với server qua REST API, xác thực bằng JWT, phân quyền theo vai trò (RBAC) ở tầng middleware.

## Bắt đầu nhanh

Yêu cầu: Node.js ≥ 18, MongoDB (local hoặc Atlas).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # cấu hình MONGO_URI, JWT_SECRET
npm run seed               # tạo dữ liệu mẫu
npm run dev

# 2. Frontend (terminal khác)
cd frontend
npm install
cp .env.example .env
npm run dev
```

| Service | URL |
|---|---|
| Backend API |  |
| Frontend | [https://blood-donation-jet-nine.vercel.app/] |


> Mở nhanh cả 2 project cùng lúc trong VS Code bằng file `BloodDonation.code-workspace`.

## Tài liệu chi tiết

- [Backend — API, biến môi trường, seed data](backend/README.md)
- [Frontend — cấu hình, phân quyền route](frontend/README.md)

## Công nghệ sử dụng

**Backend:** Express, Mongoose, JWT, bcryptjs
**Frontend:** React, React Router, Ant Design, Axios, Recharts
**Database:** MongoDB
