const Notification = require("../models/Notification");
const User = require("../models/User");
const Donation = require("../models/Donation");
const Hospital = require("../models/Hospital");

const MESSAGES = {
  TESTED: (unit) =>
    unit.testResult === "FAILED"
      ? {
          title: "Kết quả xét nghiệm: Không đạt",
          content: `Đơn vị máu ${unit.code} từ lần hiến của bạn không đạt yêu cầu xét nghiệm. Lý do: ${unit.testFailReason || "không rõ"}. ${unit.testRecommendation ? "Khuyến nghị: " + unit.testRecommendation : ""}`,
        }
      : { title: "Có kết quả xét nghiệm", content: `Đơn vị máu ${unit.code} từ lần hiến của bạn đã xét nghiệm đạt yêu cầu.` },
  STORED: (unit) => ({ title: "Đã lưu trữ", content: `Đơn vị máu ${unit.code} từ lần hiến của bạn đã được lưu trữ tại kho BVTW Huế.` }),
  DISPATCHED: (unit, hospitalName) => ({
    title: "Đang được điều phối",
    content: `Đơn vị máu ${unit.code} từ lần hiến của bạn đang được điều phối đến ${hospitalName || "một bệnh viện"}.`,
  }),
  RECEIVED: (unit, hospitalName) => ({
    title: "Bệnh viện đã tiếp nhận",
    content: `Đơn vị máu ${unit.code} từ lần hiến của bạn đã được ${hospitalName || "bệnh viện"} tiếp nhận.`,
  }),
  USED: (unit, hospitalName) => ({
    title: "Đã cứu giúp một bệnh nhân!",
    content: `Đơn vị máu ${unit.code} từ lần hiến của bạn đã được sử dụng cho bệnh nhân tại ${hospitalName || "bệnh viện"}${unit.department ? " (" + unit.department + ")" : ""}. Cảm ơn bạn đã hiến máu!`,
  }),
  DISCARDED: (unit) =>
    unit.discardReason
      ? {
          title: "Đơn vị máu đã bị huỷ tại bệnh viện",
          content: `Đơn vị máu ${unit.code} từ lần hiến của bạn đã bị huỷ tại bệnh viện. Lý do: ${unit.discardReason}.`,
        }
      : {
          title: "Đơn vị máu không đạt yêu cầu",
          content: `Đơn vị máu ${unit.code} từ lần hiến của bạn không đạt yêu cầu xét nghiệm và đã được huỷ. ${unit.testRecommendation ? "Khuyến nghị: " + unit.testRecommendation : ""}`,
        },
};

async function notifyDonorOfBloodUnitStatus(unit, status) {
  try {
    if (!MESSAGES[status]) return;

    const donation = await Donation.findById(unit.donationId);
    if (!donation) return;

    const user = await User.findOne({ donorId: donation.donorId, role: "DONOR" });
    if (!user) return;

    let hospitalName = null;
    if (unit.currentHospital) {
      const hospital = await Hospital.findById(unit.currentHospital).select("name");
      hospitalName = hospital?.name;
    }

    const { title, content } = MESSAGES[status](unit, hospitalName);
    await Notification.create({ title, content, receiverId: user._id });
  } catch (err) {
    console.error("[notifyDonorOfBloodUnitStatus] Lỗi tạo thông báo tự động:", err.message);
  }
}

async function notifyCentralOfBloodUnitEvent(unit, actingUser, title, content) {
  try {
    const centralUsers = await User.find({ role: "CENTRAL" });
    await Promise.all(centralUsers.map((u) => Notification.create({ title, content, receiverId: u._id })));
  } catch (err) {
    console.error("[notifyCentralOfBloodUnitEvent] Lỗi tạo thông báo tự động:", err.message);
  }
}

module.exports = { notifyDonorOfBloodUnitStatus, notifyCentralOfBloodUnitEvent };
