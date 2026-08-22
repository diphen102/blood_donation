const ROLES = ["ADMIN", "CENTRAL", "HOSPITAL", "DONOR"];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Vòng đời BloodUnit (đúng thứ tự - mục 4.4 báo cáo tuần 2)
// DISCARDED: nhánh riêng khi xét nghiệm không đạt (mục 4.2 - "Huỷ đơn vị máu"), không nằm trong luồng chính.
const BLOOD_UNIT_STATUS = [
  "COLLECTED",
  "TESTED",
  "STORED",
  "DISPATCHED",
  "RECEIVED",
  "USED",
  "DISCARDED",
];

const TEST_RESULTS = ["PASSED", "FAILED"];

// Danh sách gợi ý cho frontend (không ép enum ở backend vì cho phép CENTRAL tự nhập thêm lý do/khuyến nghị khác)
const TEST_FAIL_REASONS_SUGGESTED = [
  "Dương tính viêm gan B",
  "Dương tính viêm gan C",
  "Dương tính HIV",
  "Dương tính giang mai",
  "Chỉ số không đạt yêu cầu",
];
const TEST_RECOMMENDATIONS_SUGGESTED = [
  "Khuyến nghị khám lại gấp",
  "Khuyến nghị tái xét nghiệm trong 6 tháng",
  "Không cần theo dõi thêm",
];

// BloodRequest status
const BLOOD_REQUEST_STATUS = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

// Loại hiến máu - mỗi loại có thời gian chờ tối thiểu trước khi hiến lại khác nhau.
// Số ngày dưới đây là giá trị tham khảo phổ biến, KHÔNG phải tư vấn y khoa chính thức -
// CENTRAL nên đối chiếu với hướng dẫn của Viện Huyết học / Bộ Y tế khi triển khai thực tế.
const DONATION_TYPES = ["WHOLE_BLOOD", "PLATELET", "PLASMA"];
const DONATION_TYPE_LABELS = {
  WHOLE_BLOOD: "Toàn phần",
  PLATELET: "Tiểu cầu",
  PLASMA: "Huyết tương",
};
const DONATION_WAITING_DAYS = {
  WHOLE_BLOOD: 84,
  PLATELET: 14,
  PLASMA: 14,
};
const DONATION_DEFAULT_VOLUME = {
  WHOLE_BLOOD: 350,
  PLATELET: 250,
  PLASMA: 300,
};

module.exports = {
  ROLES,
  BLOOD_GROUPS,
  BLOOD_UNIT_STATUS,
  BLOOD_REQUEST_STATUS,
  DONATION_TYPES,
  DONATION_TYPE_LABELS,
  DONATION_WAITING_DAYS,
  DONATION_DEFAULT_VOLUME,
};
