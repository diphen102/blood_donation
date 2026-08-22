const mongoose = require("mongoose");
const BloodUnit = require("../models/BloodUnit");
const Donation = require("../models/Donation");
const asyncHandler = require("../utils/asyncHandler");
const { BLOOD_UNIT_STATUS } = require("../utils/constants");
const { notifyDonorOfBloodUnitStatus, notifyCentralOfBloodUnitEvent } = require("../utils/notifyDonor");

// Chỉ giữ lại phần ngày/tháng/năm, bỏ giờ:phút:giây (theo yêu cầu chỉ cần lưu ngày cho mỗi bước hành trình)
function dateOnly(input) {
  const d = input ? new Date(input) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// GET /api/blood-units?status=&bloodGroup=&hospitalId=&search=&page=&limit=
// CENTRAL (FR-09): xem toàn bộ kho. HOSPITAL (FR-19): chỉ xem tại bệnh viện mình.
// Có phân trang ở tầng DB (không tải hết về trình duyệt) - cần thiết khi kho có hàng nghìn đơn vị.
const getBloodUnits = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.search) filter.code = { $regex: req.query.search, $options: "i" };

  if (req.user.role === "HOSPITAL") {
    if (!req.user.hospitalId) return res.status(200).json({ items: [], total: 0, page: 1, limit: 0 });
    filter.currentHospital = req.user.hospitalId;
  } else if (req.query.hospitalId) {
    filter.currentHospital = req.query.hospitalId;
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 200); // chặn limit quá lớn để tránh lạm dụng

  const [items, total] = await Promise.all([
    BloodUnit.find(filter)
      .populate("currentHospital", "name")
      .populate("donationId", "donationDate donorId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BloodUnit.countDocuments(filter),
  ]);

  res.status(200).json({ items, total, page, limit });
});

// GET /api/blood-units/summary?hospitalId=
// Tổng hợp số lượng theo nhóm máu + trạng thái, tính bằng MongoDB aggregation (không tải hết record về).
// CENTRAL: toàn bộ kho (hoặc lọc theo hospitalId nếu truyền). HOSPITAL: luôn tự lọc theo bệnh viện mình.
const getBloodUnitSummary = asyncHandler(async (req, res) => {
  const match = {};
  // QUAN TRỌNG: aggregate() không tự ép kiểu như find(), phải tự new mongoose.Types.ObjectId()
  // nếu không currentHospital (ObjectId thật trong DB) sẽ không bao giờ khớp với string từ JWT.
  if (req.user.role === "HOSPITAL") {
    if (!req.user.hospitalId) return res.status(200).json({});
    match.currentHospital = new mongoose.Types.ObjectId(req.user.hospitalId);
  } else if (req.query.hospitalId) {
    match.currentHospital = new mongoose.Types.ObjectId(req.query.hospitalId);
  }

  const rows = await BloodUnit.aggregate([
    { $match: match },
    { $group: { _id: { bloodGroup: "$bloodGroup", status: "$status" }, count: { $sum: 1 } } },
  ]);

  // Gom về dạng { "A+": { STORED: 3, RECEIVED: 2, USED: 10, ... }, "O+": {...} }
  const summary = {};
  rows.forEach((r) => {
    const { bloodGroup, status } = r._id;
    if (!summary[bloodGroup]) summary[bloodGroup] = {};
    summary[bloodGroup][status] = r.count;
  });

  res.status(200).json(summary);
});

// GET /api/blood-units/:id
const getBloodUnitById = asyncHandler(async (req, res) => {
  const unit = await BloodUnit.findById(req.params.id)
    .populate("currentHospital", "name")
    .populate("donationId");
  if (!unit) return res.status(404).json({ message: "Không tìm thấy BloodUnit." });

  if (req.user.role === "HOSPITAL" && String(unit.currentHospital?._id) !== String(req.user.hospitalId)) {
    return res.status(403).json({ message: "Đơn vị máu này không thuộc bệnh viện của bạn." });
  }
  res.status(200).json(unit);
});

// GET /api/blood-units/for-donation/:donationId
// DONOR xem hành trình đơn vị máu bắt nguồn từ chính lần hiến máu của mình (chỉ xem, không sửa được).
// CENTRAL xem được mọi donationId.
const getBloodUnitsForDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(404).json({ message: "Không tìm thấy lần hiến máu." });

  if (req.user.role === "DONOR" && String(donation.donorId) !== String(req.user.donorId)) {
    return res.status(403).json({ message: "Đây không phải lần hiến máu của bạn." });
  }

  const units = await BloodUnit.find({ donationId: donation._id }).populate("currentHospital", "name");
  res.status(200).json(units);
});

// POST /api/blood-units  (mục 4.2 báo cáo tuần 2 - bước "Hệ thống tạo BloodUnit")
// Body tối thiểu: { code, bloodGroup, volume, donationId }
const createBloodUnit = asyncHandler(async (req, res) => {
  const { code, bloodGroup, volume, donationId, status } = req.body;
  const initialStatus = status || "COLLECTED";
  const unit = await BloodUnit.create({
    code,
    bloodGroup,
    volume,
    donationId,
    status: initialStatus,
    statusHistory: [{ status: initialStatus, date: dateOnly(new Date()) }],
  });
  res.status(201).json(unit);
});

// PUT /api/blood-units/:id
// Cho phép cập nhật mọi field cơ bản (CRUD thuần tuý của tuần 3), cộng thêm:
// - testResult/testFailReason/testRecommendation (kết quả xét nghiệm)
// - department (khoa sử dụng, khi status = USED)
// - tự động ghi lại statusHistory (chỉ ngày, không giờ) mỗi khi status thay đổi
// Lưu ý: nghiệp vụ điều phối/duyệt yêu cầu có kiểm soát chặt sẽ hoàn thiện ở tuần 5.
const updateBloodUnit = asyncHandler(async (req, res) => {
  if (req.body.status && !BLOOD_UNIT_STATUS.includes(req.body.status)) {
    return res.status(400).json({ message: `Trạng thái không hợp lệ. Chỉ nhận: ${BLOOD_UNIT_STATUS.join(", ")}` });
  }

  const current = await BloodUnit.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Không tìm thấy BloodUnit." });

  const updateOps = { $set: { ...req.body } };
  delete updateOps.$set.statusHistory; // không cho ghi đè trực tiếp qua body, chỉ hệ thống tự thêm

  if (req.body.status && req.body.status !== current.status) {
    updateOps.$push = { statusHistory: { status: req.body.status, date: dateOnly(req.body.statusDate) } };
  }
  delete updateOps.$set.statusDate;

  const unit = await BloodUnit.findByIdAndUpdate(req.params.id, updateOps, {
    new: true,
    runValidators: true,
  });

  if (req.body.status && req.body.status !== current.status) {
    notifyDonorOfBloodUnitStatus(unit, req.body.status); // không await - không để lỗi gửi thông báo chặn response
  }

  res.status(200).json(unit);
});

// PUT /api/blood-units/:id/use  (HOSPITAL đánh dấu đã sử dụng cho bệnh nhân)
// Đóng luồng: chỉ hospital đang giữ đơn vị máu (currentHospital) và đang ở trạng thái RECEIVED
// mới được đánh dấu USED. Tự động thông báo cho DONOR (đã có) và tất cả tài khoản CENTRAL (mới)
// để CENTRAL luôn biết đơn vị máu đã thực sự được dùng, không phải đoán qua trạng thái RECEIVED mãi.
const useBloodUnit = asyncHandler(async (req, res) => {
  const unit = await BloodUnit.findById(req.params.id);
  if (!unit) return res.status(404).json({ message: "Không tìm thấy BloodUnit." });

  if (String(unit.currentHospital) !== String(req.user.hospitalId)) {
    return res.status(403).json({ message: "Đơn vị máu này không thuộc bệnh viện của bạn." });
  }
  if (unit.status !== "RECEIVED") {
    return res.status(400).json({ message: `Chỉ đánh dấu "đã sử dụng" khi đơn vị máu đang ở trạng thái RECEIVED (hiện tại: ${unit.status}).` });
  }

  unit.status = "USED";
  if (req.body.department) unit.department = req.body.department;
  unit.statusHistory.push({ status: "USED", date: dateOnly(new Date()) });
  await unit.save();

  notifyDonorOfBloodUnitStatus(unit, "USED"); // báo cho DONOR
  notifyCentralOfBloodUnitEvent(
    unit,
    req.user,
    "Đơn vị máu đã được sử dụng",
    `Đơn vị máu ${unit.code} đã được đánh dấu SỬ DỤNG${unit.department ? " (Khoa " + unit.department + ")" : ""} bởi tài khoản ${req.user.username}.`
  );

  res.status(200).json(unit);
});

// PUT /api/blood-units/:id/discard  (HOSPITAL tự huỷ đơn vị máu gặp sự cố tại viện - hết hạn, hư hỏng...)
// Trước đây chỉ CENTRAL mới đổi được sang DISCARDED, khiến mọi sự cố tại bệnh viện đều phải
// báo qua CENTRAL xử lý hộ. Giờ HOSPITAL tự xử lý được với đơn vị đang ở viện mình, có ghi lý do,
// vẫn tự động thông báo cho CENTRAL biết (không phải "im lặng" xử lý).
const discardBloodUnit = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Cần nhập lý do huỷ." });

  const unit = await BloodUnit.findById(req.params.id);
  if (!unit) return res.status(404).json({ message: "Không tìm thấy BloodUnit." });

  if (String(unit.currentHospital) !== String(req.user.hospitalId)) {
    return res.status(403).json({ message: "Đơn vị máu này không thuộc bệnh viện của bạn." });
  }
  if (!["DISPATCHED", "RECEIVED"].includes(unit.status)) {
    return res.status(400).json({ message: `Chỉ huỷ được khi đơn vị đang DISPATCHED hoặc RECEIVED (hiện tại: ${unit.status}).` });
  }

  unit.status = "DISCARDED";
  unit.discardReason = reason;
  unit.discardedByHospital = req.user.hospitalId;
  unit.statusHistory.push({ status: "DISCARDED", date: dateOnly(new Date()) });
  await unit.save();

  notifyDonorOfBloodUnitStatus(unit, "DISCARDED");
  notifyCentralOfBloodUnitEvent(unit, req.user, "Đơn vị máu bị huỷ tại bệnh viện", `Đơn vị máu ${unit.code} bị huỷ tại bệnh viện. Lý do: ${reason}.`);

  res.status(200).json(unit);
});

// DELETE /api/blood-units/:id
const deleteBloodUnit = asyncHandler(async (req, res) => {
  const unit = await BloodUnit.findByIdAndDelete(req.params.id);
  if (!unit) return res.status(404).json({ message: "Không tìm thấy BloodUnit." });
  res.status(200).json({ message: "Đã xoá BloodUnit." });
});

module.exports = {
  getBloodUnits,
  getBloodUnitSummary,
  getBloodUnitById,
  getBloodUnitsForDonation,
  createBloodUnit,
  updateBloodUnit,
  useBloodUnit,
  discardBloodUnit,
  deleteBloodUnit,
};
