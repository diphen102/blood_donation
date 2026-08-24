// Script tạo dữ liệu mẫu/demo cho toàn bộ hệ thống.
// Chạy: npm run seed  (sau khi đã cấu hình .env và MongoDB đang chạy)
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Donor = require("../src/models/Donor");
const Hospital = require("../src/models/Hospital");
const Donation = require("../src/models/Donation");
const BloodUnit = require("../src/models/BloodUnit");
const BloodRequest = require("../src/models/BloodRequest");
const Notification = require("../src/models/Notification");
const Banner = require("../src/models/Banner");

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Donor.deleteMany({}),
    Hospital.deleteMany({}),
    Donation.deleteMany({}),
    BloodUnit.deleteMany({}),
    BloodRequest.deleteMany({}),
    Notification.deleteMany({}),
    Banner.deleteMany({}),
  ]);

  const donors = await Donor.create([
    { cccd: "079123456789", fullName: "Nguyễn Văn A", phone: "0901234567", bloodGroup: "O+", birthDate: new Date("1998-05-10") },
    { cccd: "079988776655", fullName: "Trần Thị B", phone: "0912345678", bloodGroup: "A+", birthDate: new Date("2000-01-15") },
    { cccd: "079111222333", fullName: "Lê Văn C", phone: "0923456789", bloodGroup: "O+", birthDate: new Date("1995-11-20") },
    { cccd: "079444555666", fullName: "Phạm Thị D", phone: "0934567890", bloodGroup: "B+", birthDate: new Date("1999-07-03") },
  ]);

  const hospitals = await Hospital.create([
    { name: "Bệnh viện Trung ương Huế", address: "16 Lê Lợi, Huế", phone: "0234381114" },
    { name: "Bệnh viện Đa khoa Đà Nẵng", address: "124 Hải Phòng, Đà Nẵng", phone: "02363821118" },
    { name: "Bệnh viện Đa khoa Quảng Trị", address: "266 Hùng Vương, Quảng Trị", phone: "0233852184" },
  ]);
  const [, bvDaNang, bvQuangTri] = hospitals;

  const passwordHash = await bcrypt.hash("123456", 10);
  const users = await User.create([
    { username: "admin", password: passwordHash, role: "ADMIN" },
    { username: "central", password: passwordHash, role: "CENTRAL" },
    { username: "hospital1", password: passwordHash, role: "HOSPITAL", hospitalId: bvDaNang._id },
    { username: "hospital2", password: passwordHash, role: "HOSPITAL", hospitalId: bvQuangTri._id },
    { username: "donor1", password: passwordHash, role: "DONOR", donorId: donors[0]._id },
    { username: "donor2", password: passwordHash, role: "DONOR", donorId: donors[1]._id },
  ]);

  const donations = await Donation.create([
    { donorId: donors[0]._id, donationDate: new Date("2026-06-01"), location: "BVTW Huế", donationType: "WHOLE_BLOOD" },
    { donorId: donors[1]._id, donationDate: new Date("2026-06-10"), location: "BVTW Huế", donationType: "PLATELET" },
    { donorId: donors[2]._id, donationDate: new Date("2026-06-15"), location: "BVTW Huế", donationType: "WHOLE_BLOOD" },
    { donorId: donors[3]._id, donationDate: new Date("2026-07-01"), location: "BVTW Huế", donationType: "PLASMA" },
    { donorId: donors[0]._id, donationDate: new Date("2026-07-20"), location: "BVTW Huế", donationType: "WHOLE_BLOOD" },
  ]);

  const d = (y, m, day) => new Date(y, m - 1, day);

  // donationType của mỗi BloodUnit LUÔN khớp với donationType của Donation gốc tương ứng
  // (đúng theo cách createDonation ở donation.controller.js tự gán) - dữ liệu mẫu phải nhất quán.
  await BloodUnit.create([
    { code: "BU-0001", bloodGroup: "O+", volume: 350, donationType: "WHOLE_BLOOD", status: "STORED", donationId: donations[0]._id,
      statusHistory: [{ status: "COLLECTED", date: d(2026, 6, 1) }, { status: "TESTED", date: d(2026, 6, 2) }, { status: "STORED", date: d(2026, 6, 3) }] },
    { code: "BU-0002", bloodGroup: "O+", volume: 350, donationType: "WHOLE_BLOOD", status: "STORED", donationId: donations[2]._id,
      statusHistory: [{ status: "COLLECTED", date: d(2026, 6, 15) }, { status: "TESTED", date: d(2026, 6, 16) }, { status: "STORED", date: d(2026, 6, 17) }] },
    { code: "BU-0003", bloodGroup: "O+", volume: 350, donationType: "WHOLE_BLOOD", status: "STORED", donationId: donations[4]._id,
      statusHistory: [{ status: "COLLECTED", date: d(2026, 7, 20) }, { status: "TESTED", date: d(2026, 7, 21) }, { status: "STORED", date: d(2026, 7, 22) }] },
    { code: "BU-0004", bloodGroup: "A+", volume: 250, donationType: "PLATELET", status: "TESTED", donationId: donations[1]._id,
      statusHistory: [{ status: "COLLECTED", date: d(2026, 6, 10) }, { status: "TESTED", date: d(2026, 6, 11) }] },
    { code: "BU-0005", bloodGroup: "B+", volume: 300, donationType: "PLASMA", status: "COLLECTED", donationId: donations[3]._id,
      statusHistory: [{ status: "COLLECTED", date: d(2026, 7, 1) }] },
    { code: "BU-0006", bloodGroup: "O+", volume: 350, donationType: "WHOLE_BLOOD", status: "USED", currentHospital: bvDaNang._id, department: "Khoa Cấp cứu", donationId: donations[0]._id,
      statusHistory: [
        { status: "COLLECTED", date: d(2026, 6, 1) }, { status: "TESTED", date: d(2026, 6, 2) }, { status: "STORED", date: d(2026, 6, 3) },
        { status: "DISPATCHED", date: d(2026, 7, 5) }, { status: "RECEIVED", date: d(2026, 7, 6) }, { status: "USED", date: d(2026, 7, 8) },
      ] },
    { code: "BU-0007", bloodGroup: "B+", volume: 300, donationType: "PLASMA", status: "DISCARDED", donationId: donations[3]._id,
      testResult: "FAILED", testFailReason: "Dương tính viêm gan B", testRecommendation: "Khuyến nghị khám lại gấp",
      statusHistory: [{ status: "COLLECTED", date: d(2026, 7, 1) }, { status: "TESTED", date: d(2026, 7, 2) }, { status: "DISCARDED", date: d(2026, 7, 2) }] },
  ]);

  await BloodRequest.create([
    { hospitalId: bvDaNang._id, bloodGroup: "O+", quantity: 2, reason: "Cấp cứu tai nạn giao thông", status: "PENDING" },
    { hospitalId: bvQuangTri._id, bloodGroup: "A+", quantity: 1, reason: "Phẫu thuật theo lịch", status: "PENDING" },
  ]);

  await Notification.create([
    { title: "Chương trình hiến máu tháng 8", content: "BVTW Huế tổ chức chương trình hiến máu tình nguyện vào 10/08/2026.", receiverId: null },
    { title: "Cảm ơn bạn đã hiến máu!", content: "Đơn vị máu của bạn đã được sử dụng để cứu 1 bệnh nhân tại BV Đà Nẵng.", receiverId: users[4]._id },
  ]);

  await Banner.create([
    {
      title: "Hiến máu cứu người - Một nghĩa cử cao đẹp",
      image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-08-31"),
    },
    {
      title: "Ngày hội hiến máu tình nguyện tháng 8",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-10"),
    },
  ]);

  console.log("Đã tạo dữ liệu mẫu/demo:");
  console.log(`- ${donors.length} Donor, ${hospitals.length} Hospital, ${donations.length} Donation, 7 BloodUnit, 2 BloodRequest, 2 Notification, 2 Banner`);
  console.log("- Users (mật khẩu chung 123456):", users.map((u) => `${u.username} (${u.role})`).join(", "));

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
