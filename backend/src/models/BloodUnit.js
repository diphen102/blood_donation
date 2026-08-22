const mongoose = require("mongoose");
const { BLOOD_GROUPS, BLOOD_UNIT_STATUS } = require("../utils/constants");

const bloodUnitSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    volume: { type: Number, required: true }, // ml

    status: {
      type: String,
      enum: BLOOD_UNIT_STATUS,
      default: "COLLECTED",
    },

    // Bệnh viện đang lưu trữ / được điều phối đến (null = đang ở kho BVTW)
    currentHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },

    // Field bổ sung đã xác nhận ở báo cáo tuần 2 (mục 5 - ERD):
    // truy vết đơn vị máu về đúng lần hiến máu đã tạo ra nó
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },

    // Nếu BloodUnit đang phục vụ một BloodRequest cụ thể (từ lúc DISPATCHED)
    bloodRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", default: null },

    // Kết quả xét nghiệm (xác nhận bổ sung sau tuần 5)
    testResult: { type: String, enum: ["PASSED", "FAILED"], default: null },
    testFailReason: { type: String, default: null }, // chọn từ gợi ý hoặc CENTRAL tự nhập
    testRecommendation: { type: String, default: null }, // chọn từ gợi ý hoặc CENTRAL tự nhập

    // Huỷ tại bệnh viện (khác nguyên nhân với testFailReason - đây là sự cố sau khi đã nhận, VD: hết hạn, hư hỏng khi vận chuyển)
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
