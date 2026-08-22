const Hospital = require("../models/Hospital");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/hospitals  (mọi role đã đăng nhập đều xem được - FR-10, FR-16, FR-19)
const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find().sort({ name: 1 });
  res.status(200).json(hospitals);
});

// GET /api/hospitals/:id
const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ message: "Không tìm thấy Hospital." });
  res.status(200).json(hospital);
});

// POST /api/hospitals  (FR-10 - CENTRAL)
const createHospital = asyncHandler(async (req, res) => {
  const { name, address, phone } = req.body;
  const hospital = await Hospital.create({ name, address, phone });
  res.status(201).json(hospital);
});

// PUT /api/hospitals/:id
const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!hospital) return res.status(404).json({ message: "Không tìm thấy Hospital." });
  res.status(200).json(hospital);
});

// DELETE /api/hospitals/:id
const deleteHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findByIdAndDelete(req.params.id);
  if (!hospital) return res.status(404).json({ message: "Không tìm thấy Hospital." });
  res.status(200).json({ message: "Đã xoá Hospital." });
});

module.exports = { getHospitals, getHospitalById, createHospital, updateHospital, deleteHospital };
