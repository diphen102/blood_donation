# Blood Donation Frontend

## Cài đặt

```bash
cd frontend
npm install
cp .env.example .env    # sửa VITE_API_URL nếu backend không chạy ở :5000
```

## Chạy

Yêu cầu backend đang chạy trước.

```bash
npm run dev
```

Mở `http://localhost:5173`. Đăng nhập bằng tài khoản đã tạo ở bước `npm run seed` bên backend (VD: `central` / `123456`).

## Cập nhật gần nhất

- **Đổi mật khẩu tự phục vụ**: menu người dùng (góc trên phải) có mục "Đổi mật khẩu" cho mọi role, gọi `PUT /auth/change-password`.
- **Tồn kho đơn vị máu tách theo loại chế phẩm**: Dashboard CENTRAL/HOSPITAL và trang "Đơn vị máu" (cả CENTRAL lẫn HOSPITAL) nay hiển thị và lọc riêng máu Toàn phần / Tiểu cầu / Huyết tương trong cùng 1 nhóm máu, thay vì cộng gộp.

## Phạm vi đã làm

Login, Routing, PrivateRoute, Layout chung, Dashboard đầy đủ cho cả 4 role, CRUD Donor/Donation/Hospital/BloodUnit (CENTRAL), Notification (CENTRAL soạn/gửi), Banner (CENTRAL CRUD), BloodRequest (HOSPITAL tạo + xác nhận nhận, CENTRAL duyệt/từ chối), quản lý tài khoản (ADMIN), tìm kiếm/lọc/pagination nâng cao, biểu đồ thống kê (recharts).

## Chưa làm

- Kiểm thử thực tế trên môi trường có mạng.
- Chụp ảnh màn hình cho báo cáo.
