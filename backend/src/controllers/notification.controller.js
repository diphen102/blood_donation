const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().populate("receiverId", "username").sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ receiverId: req.user.id }, { receiverId: null }],
  }).sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

const createNotification = asyncHandler(async (req, res) => {
  const { title, content, receiverId } = req.body;
  const notification = await Notification.create({ title, content, receiverId: receiverId || null });
  res.status(201).json(notification);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo." });

  if (notification.receiverId && notification.receiverId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Không phải thông báo của bạn." });
  }
  if (notification.receiverId) {
    notification.isRead = true;
    await notification.save();
  }
  res.status(200).json(notification);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo." });
  res.status(200).json({ message: "Đã xoá thông báo." });
});

module.exports = { getNotifications, getMyNotifications, createNotification, markAsRead, deleteNotification };
