const mongoose = require("mongoose");

// Banner / tin tức / chương trình hiến máu - FR-13
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // URL ảnh
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
