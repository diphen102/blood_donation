# Blood Donation Frontend — Tuần 4

## Cài đặt

```bash
cd frontend
npm install
cp .env.example .env    # sửa VITE_API_URL nếu backend không chạy ở :5000
```

## Chạy

Yêu cầu backend (tuần 3) đang chạy trước.

```bash
npm run dev
```

Mở `http://localhost:5173`. Đăng nhập bằng tài khoản đã tạo ở bước `npm run seed` bên backend (VD: `central` / `123456`).

## Phạm vi đã làm

**Tuần 4:** Login, Routing, PrivateRoute, Layout chung, Dashboard cơ bản, CRUD Donor/Donation/Hospital/BloodUnit (CENTRAL).

**Tuần 5:** Dashboard đầy đủ cho cả 4 role, trang Notification (CENTRAL soạn/gửi), Banner (CENTRAL CRUD), BloodRequest (HOSPITAL tạo + xác nhận nhận, CENTRAL duyệt/từ chối), quản lý tài khoản (ADMIN).

**Tuần 6:** Tìm kiếm nhanh + lọc theo cột + pagination nâng cao trên các bảng; biểu đồ thống kê (bar/pie chart bằng recharts) trên Dashboard CENTRAL/HOSPITAL.

## Chưa làm (đúng kế hoạch)

- Kiểm thử thực tế trên môi trường có mạng (mình chỉ kiểm tra được cú pháp/cân bằng ngoặc, chưa tự build/run được — xem phần "Giới hạn môi trường" trong báo cáo).
- Chụp ảnh màn hình cho báo cáo — cần bạn tự chạy app rồi chụp, mình không có môi trường hiển thị giao diện thật để tự chụp.
