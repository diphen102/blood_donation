const Banner = require("../models/Banner");
const asyncHandler = require("../utils/asyncHandler");

const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ startDate: -1 });
  res.status(200).json(banners);
});

const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner." });
  res.status(200).json(banner);
});

const createBanner = asyncHandler(async (req, res) => {
  const { title, image, startDate, endDate } = req.body;
  const banner = await Banner.create({ title, image, startDate, endDate });
  res.status(201).json(banner);
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner." });
  res.status(200).json(banner);
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner." });
  res.status(200).json({ message: "Đã xoá Banner." });
});

module.exports = { getBanners, getBannerById, createBanner, updateBanner, deleteBanner };
