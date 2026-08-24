// Vá field `donationType` cho các BloodUnit đã tồn tại trong MongoDB TRƯỚC khi field này
// được thêm vào schema. Mongoose sẽ ngầm gán default "WHOLE_BLOOD" cho các bản ghi cũ dù
// thực ra có thể là tiểu cầu/huyết tương - script này đối chiếu lại đúng theo Donation gốc.
// Chạy 1 LẦN DUY NHẤT sau khi deploy thay đổi: npm run backfill:donation-type
require("dotenv").config();
const connectDB = require("../src/config/db");
const BloodUnit = require("../src/models/BloodUnit");
const Donation = require("../src/models/Donation");

async function run() {
  await connectDB();

  const units = await BloodUnit.find({ donationType: { $exists: false } });
  console.log(`Tìm thấy ${units.length} BloodUnit chưa có donationType.`);

  let updated = 0;
  let skipped = 0;
  for (const unit of units) {
    const donation = await Donation.findById(unit.donationId);
    if (!donation) {
      skipped += 1;
      continue;
    }
    unit.donationType = donation.donationType || "WHOLE_BLOOD";
    await unit.save();
    updated += 1;
  }

  console.log(`Đã backfill: ${updated} bản ghi cập nhật, ${skipped} bản ghi bỏ qua (không tìm thấy Donation gốc).`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Backfill thất bại:", err);
  process.exit(1);
});
