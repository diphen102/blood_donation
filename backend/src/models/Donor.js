const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("../utils/constants");

const donorSchema = new mongoose.Schema(
  {
    cccd: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    birthDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donor", donorSchema);
