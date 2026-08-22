const Banner = require("../models/Banner");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/banners  (mọi role đã đăng nhập đều xem được - FR-06)
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ startDate: -1 });
  res.status(200).json(banners);
});

// GET /api/banners/:id
const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner." });
  res.status(200).json(banner);
});

// POST /api/banners  (CENTRAL - FR-13)
const createBanner = asyncHandler(async (req, res) => {
  const { title, image, startDate, endDate } = req.body;
  const banner = await Banner.create({ title, image, startDate, endDate });
  res.status(201).json(banner);
});

// PUT /api/banners/:id
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner." });
  res.status(200).json(banner);
});

// DELETE /api/banners/:id
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner." });
  res.status(200).json({ message: "Đã xoá Banner." });
});

module.exports = { getBanners, getBannerById, createBanner, updateBanner, deleteBanner };
