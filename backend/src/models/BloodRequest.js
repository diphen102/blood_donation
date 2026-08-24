const mongoose = require("mongoose");
const { BLOOD_GROUPS, BLOOD_REQUEST_STATUS } = require("../utils/constants");

const bloodRequestSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: BLOOD_REQUEST_STATUS, default: "PENDING" },
    assignedUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: "BloodUnit" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
