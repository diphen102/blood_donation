# Blood Donation Backend

## Cài đặt

```bash
cd backend
npm install
cp .env.example .env   # rồi sửa MONGO_URI / JWT_SECRET nếu cần
```

## Chạy

```bash
npm run dev      # có nodemon, tự reload
# hoặc
npm start
```

Kiểm tra nhanh: `GET /api/health`.

## Tạo dữ liệu mẫu để test

```bash
npm run seed
```

Tạo sẵn: 4 Donor, 3 Hospital, và 6 tài khoản (mật khẩu chung `123456`):

| username | role |
|---|---|
| admin | ADMIN |
| central | CENTRAL |
| hospital1 | HOSPITAL (Bệnh viện Đa khoa Đà Nẵng) |
| hospital2 | HOSPITAL (Bệnh viện Đa khoa Quảng Trị) |
| donor1 | DONOR (đã liên kết sẵn với Donor mẫu) |
| donor2 | DONOR (đã liên kết sẵn với Donor mẫu) |

Kèm sẵn: 5 Donation, 7 BloodUnit (đủ trạng thái + đủ loại chế phẩm), 2 BloodRequest (PENDING), 2 Notification, 2 Banner.

## Nếu đã có dữ liệu cũ trong MongoDB

BloodUnit tạo trước khi thêm field `donationType` sẽ mặc định bị gán `WHOLE_BLOOD` (theo schema default) dù có thể thực ra là tiểu cầu/huyết tương. Chạy 1 lần để vá lại đúng theo `Donation.donationType` gốc:

```bash
npm run backfill:donation-type
```

## Module đã hoàn thành

Auth JWT (đăng ký/đăng nhập/`me`/**đổi mật khẩu tự phục vụ**), CRUD Donor/Donation/Hospital/BloodUnit/BloodRequest, Notification (CRUD + gửi + đánh dấu đã đọc), Banner (CRUD), User management (ADMIN), BloodRequest duyệt + điều phối tự động (`PUT /:id/decision`) + xác nhận nhận (`PUT /:id/receive`).

**Kho máu cho HOSPITAL**: `GET /blood-units` tự lọc theo bệnh viện, có phân trang thật + lọc theo `status`/`bloodGroup`/`donationType`. `GET /blood-units/summary` dùng MongoDB aggregation, tổng hợp theo nhóm máu + **loại chế phẩm** + trạng thái để không gộp lẫn máu toàn phần với tiểu cầu/huyết tương.

**Hồ sơ cá nhân cho DONOR**: `GET /donors/me`. **Hành trình đơn vị máu theo lần hiến**: `GET /blood-units/for-donation/:donationId`. Kết quả xét nghiệm + trạng thái DISCARDED, khoa sử dụng, lịch sử ngày từng bước (`statusHistory`), và thông báo tự động cho DONOR mỗi khi đơn vị máu từ lần hiến của họ đổi trạng thái — xem `src/utils/notifyDonor.js`.

**Khép luồng HOSPITAL ⇄ CENTRAL**: `PUT /blood-units/:id/use` (HOSPITAL, chỉ áp dụng đơn vị đang RECEIVED tại đúng bệnh viện mình) — tự chuyển status = USED và thông báo cho cả DONOR lẫn mọi tài khoản CENTRAL. `PUT /blood-units/:id/discard` (HOSPITAL tự huỷ đơn vị gặp sự cố tại viện, vẫn tự động báo cho CENTRAL).

**Gộp quy trình Donation + BloodUnit**: `POST /api/donations` tạo cả Donation và BloodUnit trong 1 lần gọi — nhóm máu VÀ loại chế phẩm của BloodUnit luôn lấy tự động từ Donor/Donation, mã đơn vị tự sinh nếu không nhập.

## Test bằng Postman

Import file `BloodDonation_Week3.postman_collection.json` vào Postman. Chạy lần lượt theo thứ tự folder.
