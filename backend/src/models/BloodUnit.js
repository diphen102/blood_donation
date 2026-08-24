const mongoose = require("mongoose");
const { BLOOD_GROUPS, BLOOD_UNIT_STATUS, DONATION_TYPES } = require("../utils/constants");

const bloodUnitSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    volume: { type: Number, required: true }, // ml

    // Denormalize từ Donation.donationType (giống cách bloodGroup denormalize từ Donor) -
    // để tổng hợp/lọc theo loại chế phẩm ở tầng aggregation mà không cần $lookup sang Donation.
    donationType: { type: String, enum: DONATION_TYPES, default: "WHOLE_BLOOD" },

    status: {
      type: String,
      enum: BLOOD_UNIT_STATUS,
      default: "COLLECTED",
    },

    // Bệnh viện đang lưu trữ / được điều phối đến (null = đang ở kho BVTW)
    currentHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },

    // Truy vết đơn vị máu về đúng lần hiến máu đã tạo ra nó
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },

    // Nếu BloodUnit đang phục vụ một BloodRequest cụ thể (từ lúc DISPATCHED)
    bloodRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", default: null },

    // Kết quả xét nghiệm
    testResult: { type: String, enum: ["PASSED", "FAILED"], default: null },
    testFailReason: { type: String, default: null },
    testRecommendation: { type: String, default: null },

    // Huỷ tại bệnh viện (khác nguyên nhân với testFailReason - sự cố sau khi đã nhận: hết hạn, hư hỏng khi vận chuyển)
    discardReason: { type: String, default: null },
    discardedByHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },

    // Khoa tiếp nhận sử dụng tại bệnh viện (chỉ có ý nghĩa khi status = USED)
    department: { type: String, default: null },

    // Lịch sử ngày của từng bước trong hành trình (chỉ lưu ngày/tháng/năm, không lưu giờ)
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: BLOOD_UNIT_STATUS, required: true },
        date: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodUnit", bloodUnitSchema);
