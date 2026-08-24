const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Donor = require("../models/Donor");
const asyncHandler = require("../utils/asyncHandler");

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      donorId: user.donorId,
      hospitalId: user.hospitalId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
// Body: { username, password, cccd, phone }
const register = asyncHandler(async (req, res) => {
  const { username, password, cccd, phone } = req.body;

  if (!username || !password || !cccd || !phone) {
    return res.status(400).json({ message: "Thiếu username, password, cccd hoặc phone." });
  }

  const existed = await User.findOne({ username });
  if (existed) {
    return res.status(409).json({ message: "Username đã tồn tại." });
  }

  const donor = await Donor.findOne({ cccd });

  let donorId = null;
  let linked = false;

  if (donor && donor.phone === phone) {
    donorId = donor._id;
    linked = true;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    role: "DONOR",
    donorId,
  });

  const token = signToken(user);

  return res.status(201).json({
    message: linked
      ? "Đăng ký thành công, đã liên kết với hồ sơ hiến máu có sẵn."
      : "Đăng ký thành công (chưa có hồ sơ hiến máu nào khớp CCCD + SĐT).",
    linked,
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      donorId: user.donorId,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Thiếu username hoặc password." });
  }

  const user = await User.findOne({ username });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Sai username hoặc password." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Sai username hoặc password." });
  }

  const token = signToken(user);

  return res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      donorId: user.donorId,
      hospitalId: user.hospitalId,
    },
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy user." });
  }
  return res.status(200).json({
    id: user._id,
    username: user.username,
    role: user.role,
    donorId: user.donorId,
    hospitalId: user.hospitalId,
    isActive: user.isActive,
  });
});

// PUT /api/auth/change-password (mọi role tự đổi mật khẩu của chính mình)
// Body: { oldPassword, newPassword }
// Tách biệt với chức năng ADMIN reset mật khẩu tạm cho người khác (user.controller.js resetPassword).
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Thiếu oldPassword hoặc newPassword." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải từ 6 ký tự trở lên." });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy user." });

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(401).json({ message: "Mật khẩu hiện tại không đúng." });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Đã đổi mật khẩu thành công." });
});

module.exports = { register, login, me, changePassword };
