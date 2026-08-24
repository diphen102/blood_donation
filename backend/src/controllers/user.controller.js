const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../utils/constants");

// GET /api/users (ADMIN)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("hospitalId", "name").sort({ createdAt: -1 });
  res.status(200).json(users);
});

// POST /api/users (ADMIN tạo tài khoản CENTRAL/HOSPITAL/ADMIN)
// DONOR tự đăng ký qua /api/auth/register, không tạo qua đây.
const createUser = asyncHandler(async (req, res) => {
  const { username, password, role, hospitalId } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Thiếu username, password hoặc role." });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: `role không hợp lệ. Chỉ nhận: ${ROLES.join(", ")}` });
  }
  if (role === "HOSPITAL" && !hospitalId) {
    return res.status(400).json({ message: "Tài khoản HOSPITAL cần có hospitalId." });
  }

  const existed = await User.findOne({ username });
  if (existed) return res.status(409).json({ message: "Username đã tồn tại." });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword, role, hospitalId: hospitalId || null });

  const { password: _, ...safeUser } = user.toObject();
  res.status(201).json(safeUser);
});

// PUT /api/users/:id/toggle-active
const toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy user." });

  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({ id: user._id, isActive: user.isActive });
});

// PUT /api/users/:id/role
const updateRole = asyncHandler(async (req, res) => {
  const { role, hospitalId } = req.body;
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: `role không hợp lệ. Chỉ nhận: ${ROLES.join(", ")}` });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy user." });

  user.role = role;
  user.hospitalId = role === "HOSPITAL" ? hospitalId || user.hospitalId : null;
  await user.save();

  const { password, ...safeUser } = user.toObject();
  res.status(200).json(safeUser);
});

// PUT /api/users/:id/reset-password (ADMIN - reset mật khẩu tạm cho NGƯỜI KHÁC,
// khác với /api/auth/change-password là người dùng tự đổi mật khẩu của chính mình)
const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy user." });

  const tempPassword = crypto.randomBytes(4).toString("hex");
  user.password = await bcrypt.hash(tempPassword, 10);
  await user.save();

  res.status(200).json({
    message: "Đã đặt lại mật khẩu. Mật khẩu tạm CHỈ hiển thị 1 lần này — hãy báo trực tiếp cho người dùng (điện thoại/gặp mặt), hệ thống không tự gửi SMS/email.",
    username: user.username,
    tempPassword,
  });
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy user." });
  res.status(200).json({ message: "Đã xoá user." });
});

module.exports = { getUsers, createUser, toggleActive, updateRole, resetPassword, deleteUser };
