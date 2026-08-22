const mongoose = require("mongoose");
const { ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // đã hash bcrypt
    role: { type: String, enum: ROLES, required: true, default: "DONOR" },

    // Liên kết hồ sơ Donor (mục 4.1 - Quy trình liên kết tài khoản bằng CCCD)
    // Chỉ có giá trị khi role = DONOR và đã tìm thấy hồ sơ khớp CCCD + SĐT
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", default: null },

    // Bổ sung kỹ thuật (đã ghi chú trong báo cáo tuần 3):
    // cần thiết để tài khoản HOSPITAL biết mình thuộc bệnh viện nào khi tạo BloodRequest (FR-16)
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },

    isActive: { type: Boolean, default: true }, // phục vụ FR-20 khoá tài khoản
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
