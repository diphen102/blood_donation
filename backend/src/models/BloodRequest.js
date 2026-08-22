const mongoose = require("mongoose");
const { BLOOD_GROUPS, BLOOD_REQUEST_STATUS } = require("../utils/constants");

const bloodRequestSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    quantity: { type: Number, required: true, min: 1 }, // số đơn vị máu cần
    reason: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: BLOOD_REQUEST_STATUS,
      default: "PENDING",
    },

    // Danh sách BloodUnit đã điều phối cho yêu cầu này (mục 4.3 báo cáo tuần 2)
    assignedUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: "BloodUnit" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
