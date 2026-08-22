const Donation = require("../models/Donation");
const Donor = require("../models/Donor");
const BloodUnit = require("../models/BloodUnit");
const User = require("../models/User");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { DONATION_WAITING_DAYS, DONATION_DEFAULT_VOLUME, DONATION_TYPE_LABELS } = require("../utils/constants");

// GET /api/donations?donorId=...  (FR-08 - CENTRAL)
const getDonations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.donorId) filter.donorId = req.query.donorId;
  const donations = await Donation.find(filter).populate("donorId", "fullName cccd bloodGroup").sort({ donationDate: -1 });
  res.status(200).json(donations);
});

// GET /api/donations/mine  (FR-04 - DONOR xem lịch sử hiến máu của chính mình)
const getMyDonations = asyncHandler(async (req, res) => {
  if (!req.user.donorId) {
    return res.status(200).json([]); // tài khoản chưa liên kết hồ sơ Donor -> chưa có lịch sử
  }
  const donations = await Donation.find({ donorId: req.user.donorId }).sort({ donationDate: -1 });
  res.status(200).json(donations);
});

// GET /api/donations/:id
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate("donorId", "fullName cccd bloodGroup");
  if (!donation) return res.status(404).json({ message: "Không tìm thấy Donation." });
  res.status(200).json(donation);
});

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// POST /api/donations  (mục 4.2 báo cáo tuần 2 - bước "CENTRAL ghi nhận Donation")
// Gộp chung 1 bước: tạo Donation VÀ BloodUnit tương ứng luôn, tránh phải thao tác 2 lần
// ở 2 trang riêng (nguồn gây nhầm lẫn thể tích/nhóm máu giữa nhiều người hiến trước đó).
// Nhóm máu của BloodUnit LUÔN lấy từ hồ sơ Donor (không cho nhập tay lại) để tránh sai lệch.
// Body tối thiểu: { donorId, donationDate, location, donationType }
// Body tuỳ chọn: { volume, unitCode } - nếu bỏ trống sẽ tự đặt theo donationType / tự sinh mã.
const createDonation = asyncHandler(async (req, res) => {
  const { donorId, donationDate, location, donationType, volume, unitCode } = req.body;

  const donor = await Donor.findById(donorId);
  if (!donor) return res.status(404).json({ message: "Không tìm thấy Donor." });

  const type = donationType || "WHOLE_BLOOD";
  const donation = await Donation.create({ donorId, donationDate, location, donationType: type });

  const code = unitCode || `BU-${donation._id.toString().slice(-8).toUpperCase()}`;
  const bloodUnit = await BloodUnit.create({
    code,
    bloodGroup: donor.bloodGroup, // tự động lấy từ hồ sơ Donor, không cho CENTRAL gõ lại
    volume: volume || DONATION_DEFAULT_VOLUME[type],
    donationId: donation._id,
    status: "COLLECTED",
    statusHistory: [{ status: "COLLECTED", date: new Date(new Date().setHours(0, 0, 0, 0)) }],
  });

  const nextEligibleDate = addDays(donationDate, DONATION_WAITING_DAYS[type]);

  // Cảm ơn + báo ngày có thể hiến lại (không chặn response nếu gửi lỗi)
  User.findOne({ donorId, role: "DONOR" })
    .then((user) => {
      if (!user) return;
      return Notification.create({
        title: "Cảm ơn bạn đã hiến máu!",
        content: `Đã ghi nhận lần hiến máu (${DONATION_TYPE_LABELS[type]}) ngày ${new Date(donationDate).toLocaleDateString("vi-VN")}. Bạn có thể hiến máu lại từ ngày ${nextEligibleDate.toLocaleDateString("vi-VN")}.`,
        receiverId: user._id,
      });
    })
    .catch((err) => console.error("[createDonation] Lỗi gửi thông báo:", err.message));

  res.status(201).json({ donation, bloodUnit, nextEligibleDate });
});

// PUT /api/donations/:id
const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!donation) return res.status(404).json({ message: "Không tìm thấy Donation." });
  res.status(200).json(donation);
});

// DELETE /api/donations/:id
const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findByIdAndDelete(req.params.id);
  if (!donation) return res.status(404).json({ message: "Không tìm thấy Donation." });
  res.status(200).json({ message: "Đã xoá Donation." });
});

module.exports = {
  getDonations,
  getMyDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
};
