const mongoose = require("mongoose");

// Thông báo gửi từ CENTRAL đến Donor (theo cá nhân hoặc theo nhóm/chương trình) - FR-14
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = gửi broadcast cho mọi DONOR
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
