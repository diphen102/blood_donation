const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/notifications  (CENTRAL - xem tất cả đã gửi, FR-14)
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().populate("receiverId", "username").sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// GET /api/notifications/mine  (DONOR - FR-05: xem thông báo của mình + broadcast)
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ receiverId: req.user.id }, { receiverId: null }],
  }).sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// POST /api/notifications  (CENTRAL tạo + gửi - FR-14)
// Body: { title, content, receiverId? }  - không truyền receiverId = gửi broadcast cho mọi DONOR
const createNotification = asyncHandler(async (req, res) => {
  const { title, content, receiverId } = req.body;
  const notification = await Notification.create({ title, content, receiverId: receiverId || null });
  res.status(201).json(notification);
});

// PUT /api/notifications/:id/read  (DONOR đánh dấu đã đọc - chỉ áp dụng thông báo cá nhân)
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo." });

  // Thông báo broadcast (receiverId = null) không có trạng thái đọc riêng theo từng người
  // trong phạm vi tuần 5 - chỉ thông báo cá nhân mới đánh dấu đã đọc được.
  if (notification.receiverId && notification.receiverId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Không phải thông báo của bạn." });
  }
  if (notification.receiverId) {
    notification.isRead = true;
    await notification.save();
  }
  res.status(200).json(notification);
});

// DELETE /api/notifications/:id  (CENTRAL)
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo." });
  res.status(200).json({ message: "Đã xoá thông báo." });
});

module.exports = { getNotifications, getMyNotifications, createNotification, markAsRead, deleteNotification };
