# Blood Donation Backend — Tuần 3

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

Server chạy tại `https://blood-donation-9bs0.onrender.com`, kiểm tra nhanh: `GET /api/health`.

## Tạo dữ liệu mẫu để test

```bash
npm run seed
```

Tạo sẵn: 1 Donor (CCCD `079123456789`, SĐT `0901234567`), 1 Hospital, và 4 tài khoản (mật khẩu chung `123456`):

| username | role |
|---|---|
| admin | ADMIN |
| central | CENTRAL |
| hospital1 | HOSPITAL (Bệnh viện Đa khoa Đà Nẵng) |
| hospital2 | HOSPITAL (Bệnh viện Đa khoa Quảng Trị) |
| donor1 | DONOR (đã liên kết sẵn với Donor mẫu) |
| donor2 | DONOR (đã liên kết sẵn với Donor mẫu) |

Kèm sẵn: 4 Donor, 3 Hospital, 5 Donation, 6 BloodUnit (đủ trạng thái), 2 BloodRequest (PENDING), 2 Notification, 2 Banner.

## Module đã hoàn thành

**Tuần 3:** Auth JWT, CRUD Donor/Donation/Hospital/BloodUnit/BloodRequest.
**Tuần 5:** Notification (CRUD + gửi + đánh dấu đã đọc), Banner (CRUD), User management (ADMIN - FR-20/21), BloodRequest duyệt + điều phối tự động (`PUT /:id/decision`) + xác nhận nhận (`PUT /:id/receive`).
**Bổ sung sau khi review:** kho máu cho HOSPITAL (`GET /blood-units` tự lọc theo bệnh viện), hồ sơ cá nhân cho DONOR (`GET /donors/me`), hành trình đơn vị máu theo lần hiến (`GET /blood-units/for-donation/:donationId`), kết quả xét nghiệm + trạng thái DISCARDED, khoa sử dụng, lịch sử ngày từng bước (`statusHistory`), và **thông báo tự động cho DONOR** mỗi khi đơn vị máu từ lần hiến của họ đổi trạng thái (xét nghiệm, lưu trữ, điều phối, tiếp nhận, sử dụng, huỷ) — xem `src/utils/notifyDonor.js`.

**Khép luồng HOSPITAL ⇄ CENTRAL:** trước đây chỉ CENTRAL mới đổi được status BloodUnit, nên khi bệnh viện tuyến dưới thực sự dùng máu, CENTRAL không có cách nào biết. Giờ có `PUT /blood-units/:id/use` (HOSPITAL, chỉ áp dụng đơn vị đang RECEIVED tại đúng bệnh viện mình) — tự chuyển status = USED và **thông báo cho cả DONOR lẫn mọi tài khoản CENTRAL** (`notifyCentralOfBloodUnitUsed`).

**Gộp quy trình Donation + BloodUnit (tối ưu nghiệp vụ):** trước đây CENTRAL phải tạo Donation rồi tạo BloodUnit ở 2 trang riêng, tự gõ lại nhóm máu (dễ nhầm giữa nhiều người hiến). Giờ `POST /api/donations` tạo cả 2 trong 1 lần gọi — nhóm máu BloodUnit LUÔN lấy tự động từ hồ sơ Donor, mã đơn vị tự sinh nếu không nhập. Đồng thời thêm `donationType` (Toàn phần/Tiểu cầu/Huyết tương), mỗi loại có số ngày chờ tối thiểu khác nhau trước khi hiến lại (`DONATION_WAITING_DAYS` trong `utils/constants.js` — giá trị tham khảo, nên đối chiếu hướng dẫn y khoa thật khi triển khai thực tế). Sau khi ghi nhận, hệ thống tự gửi thông báo cảm ơn kèm ngày có thể hiến lại cho DONOR.

**Sửa 3 vấn đề về tồn kho BloodUnit:**
1. *Thống kê lẫn đơn vị đã USED* — `GET /blood-units/summary` giờ trả về số lượng theo từng cặp (nhóm máu, trạng thái), frontend tự tách "còn dùng được" (RECEIVED/STORED) khỏi các trạng thái khác thay vì gộp chung 1 con số.
2. *HOSPITAL phải qua CENTRAL cho mọi việc* — thêm `PUT /blood-units/:id/discard` (HOSPITAL tự huỷ đơn vị gặp sự cố tại viện - hết hạn, hư hỏng khi vận chuyển - không cần CENTRAL xử lý hộ, vẫn tự động báo cho CENTRAL biết).
3. *Không chịu được kho lớn (>1000 đơn vị)* — `GET /blood-units` giờ có phân trang thật ở tầng DB (`page`, `limit`, `search`, tối đa 200 bản ghi/lần thay vì tải hết); `GET /blood-units/summary` dùng MongoDB aggregation (`$group`) để tính tổng theo nhóm máu/trạng thái ngay ở database, không phải tải toàn bộ record về rồi cộng bằng JavaScript.

## Test bằng Postman

Import file `BloodDonation_Week3.postman_collection.json` vào Postman. Chạy lần lượt theo thứ tự folder (00 → 06) — các request Login/Register/Create đã có script tự lưu token và ID vào collection variables để các request sau dùng lại, không cần copy tay (trừ 2 chỗ đã đánh dấu `__PASTE_..._ID__` cần điền tay vì phụ thuộc dữ liệu seed).
