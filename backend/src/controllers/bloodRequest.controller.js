const BloodRequest = require("../models/BloodRequest");
const BloodUnit = require("../models/BloodUnit");
const asyncHandler = require("../utils/asyncHandler");
const { BLOOD_REQUEST_STATUS } = require("../utils/constants");
const { notifyDonorOfBloodUnitStatus } = require("../utils/notifyDonor");

// GET /api/blood-requests?status=&hospitalId=
// CENTRAL: xem tất cả (FR-11) | HOSPITAL: chỉ xem của bệnh viện mình (FR-17)
const getBloodRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  if (req.user.role === "HOSPITAL") {
    if (!req.user.hospitalId) return res.status(200).json([]);
    filter.hospitalId = req.user.hospitalId;
  } else if (req.query.hospitalId) {
    filter.hospitalId = req.query.hospitalId;
  }

  const requests = await BloodRequest.find(filter)
    .populate("hospitalId", "name address")
    .sort({ createdAt: -1 });
  res.status(200).json(requests);
});

// GET /api/blood-requests/:id
const getBloodRequestById = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id).populate("hospitalId", "name address");
  if (!request) return res.status(404).json({ message: "Không tìm thấy BloodRequest." });
  res.status(200).json(request);
});

// POST /api/blood-requests  (FR-16 - HOSPITAL tạo yêu cầu)
const createBloodRequest = asyncHandler(async (req, res) => {
  const { bloodGroup, quantity, reason } = req.body;
  const hospitalId = req.user.role === "HOSPITAL" ? req.user.hospitalId : req.body.hospitalId;

  if (!hospitalId) {
    return res.status(400).json({ message: "Thiếu hospitalId (tài khoản HOSPITAL cần được gán hospitalId)." });
  }

  const request = await BloodRequest.create({ hospitalId, bloodGroup, quantity, reason });
  res.status(201).json(request);
});

// PUT /api/blood-requests/:id
// CRUD cơ bản của tuần 3: cho phép CENTRAL cập nhật mọi field, kể cả status.
// Quy trình duyệt có kiểm soát chuyển trạng thái chặt chẽ (chỉ PENDING -> APPROVED/REJECTED...)
// sẽ tách thành endpoint riêng ở tuần 5 theo đúng kế hoạch ("Duyệt yêu cầu tiếp nhận máu").
const updateBloodRequest = asyncHandler(async (req, res) => {
  if (req.body.status && !BLOOD_REQUEST_STATUS.includes(req.body.status)) {
    return res.status(400).json({ message: `Trạng thái không hợp lệ. Chỉ nhận: ${BLOOD_REQUEST_STATUS.join(", ")}` });
  }
  const request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!request) return res.status(404).json({ message: "Không tìm thấy BloodRequest." });
  res.status(200).json(request);
});

// DELETE /api/blood-requests/:id
const deleteBloodRequest = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findByIdAndDelete(req.params.id);
  if (!request) return res.status(404).json({ message: "Không tìm thấy BloodRequest." });
  res.status(200).json({ message: "Đã xoá BloodRequest." });
});

// PUT /api/blood-requests/:id/decision  (FR-11 + FR-12, CENTRAL - tính năng đặc trưng tuần 5)
// Body: { action: "APPROVED" | "REJECTED", unitIds?: string[] }
// - REJECTED: chỉ đổi status, không đụng vào BloodUnit nào.
// - APPROVED: điều phối BloodUnit (ưu tiên unitIds nếu CENTRAL tự chọn tay, không có thì hệ thống
//   tự chọn các BloodUnit đang STORED cùng nhóm máu, đủ số lượng quantity yêu cầu),
//   set BloodUnit.status = DISPATCHED, currentHospital + bloodRequestId tương ứng.
const decideBloodRequest = asyncHandler(async (req, res) => {
  const { action, unitIds } = req.body;

  if (!["APPROVED", "REJECTED"].includes(action)) {
    return res.status(400).json({ message: "action phải là APPROVED hoặc REJECTED." });
  }

  const request = await BloodRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Không tìm thấy BloodRequest." });

  if (request.status !== "PENDING") {
    return res.status(400).json({ message: `Yêu cầu đang ở trạng thái ${request.status}, chỉ có thể duyệt khi đang PENDING.` });
  }

  if (action === "REJECTED") {
    request.status = "REJECTED";
    await request.save();
    return res.status(200).json(request);
  }

  // action === "APPROVED"
  let units;
  if (Array.isArray(unitIds) && unitIds.length > 0) {
    units = await BloodUnit.find({ _id: { $in: unitIds }, status: "STORED", bloodGroup: request.bloodGroup });
    if (units.length !== unitIds.length) {
      return res.status(400).json({ message: "Một số BloodUnit được chọn không hợp lệ (không tồn tại / không phải nhóm máu đúng / không ở trạng thái STORED)." });
    }
  } else {
    units = await BloodUnit.find({ status: "STORED", bloodGroup: request.bloodGroup }).limit(request.quantity);
  }

  if (units.length < request.quantity) {
    return res.status(400).json({
      message: `Không đủ đơn vị máu nhóm ${request.bloodGroup} đang STORED trong kho (cần ${request.quantity}, có ${units.length}).`,
    });
  }

  const today = new Date();
  const dispatchDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  await BloodUnit.updateMany(
    { _id: { $in: units.map((u) => u._id) } },
    {
      $set: { status: "DISPATCHED", currentHospital: request.hospitalId, bloodRequestId: request._id },
      $push: { statusHistory: { status: "DISPATCHED", date: dispatchDate } },
    }
  );

  request.status = "APPROVED";
  request.assignedUnits = units.map((u) => u._id);
  await request.save();

  units.forEach((u) => {
    notifyDonorOfBloodUnitStatus({ ...u.toObject(), currentHospital: request.hospitalId }, "DISPATCHED");
  });

  res.status(200).json(request);
});

// PUT /api/blood-requests/:id/receive  (FR-18, HOSPITAL xác nhận đã nhận)
const receiveBloodRequest = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Không tìm thấy BloodRequest." });

  if (request.status !== "APPROVED") {
    return res.status(400).json({ message: `Yêu cầu đang ở trạng thái ${request.status}, chỉ xác nhận nhận khi đã APPROVED.` });
  }

  const units = await BloodUnit.find({ _id: { $in: request.assignedUnits } });

  const today = new Date();
  const receiveDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  await BloodUnit.updateMany(
    { _id: { $in: request.assignedUnits } },
    { $set: { status: "RECEIVED" }, $push: { statusHistory: { status: "RECEIVED", date: receiveDate } } }
  );
  request.status = "COMPLETED";
  await request.save();

  units.forEach((u) => {
    notifyDonorOfBloodUnitStatus(u, "RECEIVED");
  });

  res.status(200).json(request);
});

module.exports = {
  getBloodRequests,
  getBloodRequestById,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  decideBloodRequest,
  receiveBloodRequest,
};
