const mongoose = require("mongoose");
const { DONATION_TYPES } = require("../utils/constants");

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    donationDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    donationType: { type: String, enum: DONATION_TYPES, default: "WHOLE_BLOOD" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
