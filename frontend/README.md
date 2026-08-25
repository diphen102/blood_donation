# Frontend

Giao diện quản trị cho hệ thống hiến máu — React, Vite, Ant Design.

## Cài đặt

```bash
npm install
cp .env.example .env
```

Cấu hình `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## Chạy

```bash
npm run dev       # dev server tại http://localhost:5173
npm run build     # build production vào thư mục dist/
npm run preview   # xem thử bản build
```

Cần backend đang chạy trước khi khởi động frontend.

## Cấu trúc thư mục

```
src/
├── api/          Axios client + hàm gọi API theo resource
├── components/   Component dùng chung (bảng CRUD, modal, timeline...)
├── constants/    Enum/label dùng chung với backend
├── context/      AuthContext quản lý phiên đăng nhập
├── layouts/      Layout chính (sidebar, header)
├── pages/        Trang theo từng chức năng, chia theo module
├── routes/       PrivateRoute kiểm tra đăng nhập & phân quyền
└── utils/        Hàm xử lý dữ liệu (tổng hợp tồn kho...)
```

## Phân quyền theo route

| Route | Vai trò được truy cập |
|---|---|
| `/` | Mọi role (dashboard riêng theo role) |
| `/donors`, `/donations`, `/hospitals` | CENTRAL |
| `/blood-units` | CENTRAL, HOSPITAL |
| `/blood-requests` | CENTRAL, HOSPITAL |
| `/notifications`, `/banners` | CENTRAL |
| `/admin/users` | ADMIN |

## Công nghệ

React Router (điều hướng) · Ant Design (UI) · Axios (HTTP client) · Recharts (biểu đồ thống kê) · Day.js (xử lý ngày tháng)
