# Backend

REST API cho hệ thống quản lý hiến máu — Node.js, Express, MongoDB, JWT.

## Cài đặt

```bash
npm install
cp .env.example .env
```

Cấu hình `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blood_donation
JWT_SECRET=<chuỗi bí mật, tự sinh>
JWT_EXPIRES_IN=7d
```

## Chạy

```bash
npm run dev      # nodemon, tự reload khi sửa code
npm start        # chạy production
```

Kiểm tra server: `GET /api/health`

## Dữ liệu mẫu

```bash
npm run seed
```

Tạo sẵn 6 tài khoản (mật khẩu chung `123456`):

| Username | Vai trò |
|---|---|
| `admin` | ADMIN |
| `central` | CENTRAL |
| `hospital1` | HOSPITAL — Bệnh viện Đa khoa Đà Nẵng |
| `hospital2` | HOSPITAL — Bệnh viện Đa khoa Quảng Trị |
| `donor1`, `donor2` | DONOR (đã liên kết hồ sơ hiến máu) |

Kèm dữ liệu mẫu: Donor, Donation, BloodUnit ở đủ trạng thái, BloodRequest, Notification, Banner.

## Cấu trúc thư mục

```
src/
├── config/       Kết nối MongoDB
├── controllers/  Xử lý logic nghiệp vụ
├── middleware/   Xác thực JWT, phân quyền theo role
├── models/       Mongoose schema
├── routes/       Định tuyến API
└── utils/        Hằng số, helper dùng chung
scripts/
├── seed.js                   Tạo dữ liệu mẫu
└── backfillDonationType.js   Vá dữ liệu cũ khi thêm field donationType
```

## API endpoints

| Method | Endpoint | Quyền truy cập |
|---|---|---|
| POST | `/api/auth/login` | Công khai |
| POST | `/api/auth/register` | Công khai |
| GET | `/api/auth/me` | Đã đăng nhập |
| PUT | `/api/auth/change-password` | Đã đăng nhập |
| GET/POST/PUT/DELETE | `/api/donors` | CENTRAL |
| GET/POST/PUT/DELETE | `/api/donations` | CENTRAL |
| GET | `/api/donations/mine` | DONOR |
| GET | `/api/hospitals` | Mọi role đã đăng nhập |
| POST/PUT/DELETE | `/api/hospitals` | CENTRAL |
| GET | `/api/blood-units` | CENTRAL, HOSPITAL |
| GET | `/api/blood-units/summary` | CENTRAL, HOSPITAL |
| POST/PUT/DELETE | `/api/blood-units` | CENTRAL |
| PUT | `/api/blood-units/:id/use`, `/discard` | HOSPITAL |
| GET/POST | `/api/blood-requests` | HOSPITAL, CENTRAL |
| PUT | `/api/blood-requests/:id/decision` | CENTRAL |
| PUT | `/api/blood-requests/:id/receive` | HOSPITAL |
| GET/POST/DELETE | `/api/notifications` | CENTRAL |
| GET | `/api/notifications/mine` | DONOR |
| GET | `/api/banners` | Mọi role đã đăng nhập |
| POST/PUT/DELETE | `/api/banners` | CENTRAL |
| GET/POST/PUT/DELETE | `/api/users` | ADMIN |

## Bảo trì dữ liệu

Nếu database đã có `BloodUnit` từ trước khi thêm field `donationType`, chạy một lần:

```bash
npm run backfill:donation-type
```

## Test API bằng Postman

Import `BloodDonation_Week3.postman_collection.json`, chạy lần lượt theo thứ tự các folder trong collection.
