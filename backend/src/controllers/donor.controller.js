const Donor = require("../models/Donor");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/donors/me  (FR-03 - DONOR xem hồ sơ cá nhân của chính mình)
const getMyDonor = asyncHandler(async (req, res) => {
  if (!req.user.donorId) {
    return res.status(200).json(null); // chưa liên kết hồ sơ Donor
  }
  const donor = await Donor.findById(req.user.donorId);
  res.status(200).json(donor);
});

// GET /api/donors  (FR-07 - CENTRAL)
const getDonors = asyncHandler(async (req, res) => {
  const donors = await Donor.find().sort({ createdAt: -1 });
  res.status(200).json(donors);
});

// GET /api/donors/:id
const getDonorById = asyncHandler(async (req, res) => {
  const donor = await Donor.findById(req.params.id);
  if (!donor) return res.status(404).json({ message: "Không tìm thấy Donor." });
  res.status(200).json(donor);
});

// POST /api/donors
const createDonor = asyncHandler(async (req, res) => {
  const { cccd, fullName, phone, bloodGroup, birthDate } = req.body;
  const donor = await Donor.create({ cccd, fullName, phone, bloodGroup, birthDate });
  res.status(201).json(donor);
});

// PUT /api/donors/:id
const updateDonor = asyncHandler(async (req, res) => {
  const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!donor) return res.status(404).json({ message: "Không tìm thấy Donor." });
  res.status(200).json(donor);
});

// DELETE /api/donors/:id
const deleteDonor = asyncHandler(async (req, res) => {
  const donor = await Donor.findByIdAndDelete(req.params.id);
  if (!donor) return res.status(404).json({ message: "Không tìm thấy Donor." });
  res.status(200).json({ message: "Đã xoá Donor." });
});

module.exports = { getMyDonor, getDonors, getDonorById, createDonor, updateDonor, deleteDonor };
