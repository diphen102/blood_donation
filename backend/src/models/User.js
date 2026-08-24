const mongoose = require("mongoose");
const { ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // đã hash bcrypt
    role: { type: String, enum: ROLES, required: true, default: "DONOR" },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", default: null },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
