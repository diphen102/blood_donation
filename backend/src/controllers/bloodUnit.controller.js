const mongoose = require("mongoose");
const BloodUnit = require("../models/BloodUnit");
const Donation = require("../models/Donation");
const asyncHandler = require("../utils/asyncHandler");
const { BLOOD_UNIT_STATUS } = require("../utils/constants");
const { notifyDonorOfBloodUnitStatus, notifyCentralOfBloodUnitEvent } = require("../utils/notifyDonor");

// Chỉ giữ lại phần ngày/tháng/năm, bỏ giờ:phút:giây
function dateOnly(input) {
  const d = input ? new Date(input) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// GET /api/blood-units?status=&bloodGroup=&donationType=&hospitalId=&search=&page=&limit=
// CENTRAL: xem toàn bộ kho. HOSPITAL: chỉ xem tại bệnh viện mình.
const getBloodUnits = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.donationType) filter.donationType = req.query.donationType;
  if (req.query.search) filter.code = { $regex: req.query.search, $options: "i" };

  if (req.user.role === "HOSPITAL") {
    if (!req.user.hospitalId) return res.status(200).json({ items: [], total: 0, page: 1, limit: 0 });
    filter.currentHospital = req.user.hospitalId;
  } else if (req.query.hospitalId) {
    filter.currentHospital = req.query.hospitalId;
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 200);

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
// Tổng hợp số lượng theo nhóm máu + LOẠI CHẾ PHẨM (donationType) + trạng thái, tính bằng MongoDB
// aggregation. Trả về dạng lồng: { [bloodGroup]: { [donationType]: { [status]: count } } } -
// tách rõ máu toàn phần / tiểu cầu / huyết tương thay vì gộp chung theo nhóm máu.
// CENTRAL: toàn bộ kho (hoặc lọc theo hospitalId nếu truyền). HOSPITAL: luôn tự lọc theo bệnh viện mình.
const getBloodUnitSummary = asyncHandler(async (req, res) => {
  const match = {};
  if (req.user.role === "HOSPITAL") {
    if (!req.user.hospitalId) return res.status(200).json({});
    match.currentHospital = new mongoose.Types.ObjectId(req.user.hospitalId);
  } else if (req.query.hospitalId) {
    match.currentHospital = new mongoose.Types.ObjectId(req.query.hospitalId);
  }

  const rows = await BloodUnit.aggregate([
    { $match: match },
    {
      $group: {
        _id: { bloodGroup: "$bloodGroup", donationType: "$donationType", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = {};
  rows.forEach((r) => {
    const { bloodGroup, donationType, status } = r._id;
    if (!summary[bloodGroup]) summary[bloodGroup] = {};
    if (!summary[bloodGroup][donationType]) summary[bloodGroup][donationType] = {};
    summary[bloodGroup][donationType][status] = r.count;
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
// DONOR xem hành trình đơn vị máu bắt nguồn từ chính lần hiến máu của mình.
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

// POST /api/blood-units
// Body tối thiểu: { code, bloodGroup, volume, donationId }
// Body tuỳ chọn: { donationType } - mặc định WHOLE_BLOOD nếu không truyền.
const createBloodUnit = asyncHandler(async (req, res) => {
  const { code, bloodGroup, volume, donationId, status, donationType } = req.body;
  const initialStatus = status || "COLLECTED";
  const unit = await BloodUnit.create({
    code,
    bloodGroup,
    volume,
    donationId,
    donationType: donationType || "WHOLE_BLOOD",
    status: initialStatus,
    statusHistory: [{ status: initialStatus, date: dateOnly(new Date()) }],
  });
  res.status(201).json(unit);
});

// PUT /api/blood-units/:id
const updateBloodUnit = asyncHandler(async (req, res) => {
  if (req.body.status && !BLOOD_UNIT_STATUS.includes(req.body.status)) {
    return res.status(400).json({ message: `Trạng thái không hợp lệ. Chỉ nhận: ${BLOOD_UNIT_STATUS.join(", ")}` });
  }

  const current = await BloodUnit.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Không tìm thấy BloodUnit." });

  const updateOps = { $set: { ...req.body } };
  delete updateOps.$set.statusHistory;

  if (req.body.status && req.body.status !== current.status) {
    updateOps.$push = { statusHistory: { status: req.body.status, date: dateOnly(req.body.statusDate) } };
  }
  delete updateOps.$set.statusDate;

  const unit = await BloodUnit.findByIdAndUpdate(req.params.id, updateOps, {
    new: true,
    runValidators: true,
  });

  if (req.body.status && req.body.status !== current.status) {
    notifyDonorOfBloodUnitStatus(unit, req.body.status);
  }

  res.status(200).json(unit);
});

// PUT /api/blood-units/:id/use
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

  notifyDonorOfBloodUnitStatus(unit, "USED");
  notifyCentralOfBloodUnitEvent(
    unit,
    req.user,
    "Đơn vị máu đã được sử dụng",
    `Đơn vị máu ${unit.code} đã được đánh dấu SỬ DỤNG${unit.department ? " (Khoa " + unit.department + ")" : ""} bởi tài khoản ${req.user.username}.`
  );

  res.status(200).json(unit);
});

// PUT /api/blood-units/:id/discard
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
