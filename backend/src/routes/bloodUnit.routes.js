const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getBloodUnits,
  getBloodUnitSummary,
  getBloodUnitById,
  getBloodUnitsForDonation,
  createBloodUnit,
  updateBloodUnit,
  useBloodUnit,
  discardBloodUnit,
  deleteBloodUnit,
} = require("../controllers/bloodUnit.controller");

const router = express.Router();

router.use(authenticate);

// FR-04 / hành trình đơn vị máu: DONOR xem đơn vị máu bắt nguồn từ lần hiến của chính mình
router.get("/for-donation/:donationId", authorize("DONOR", "CENTRAL"), getBloodUnitsForDonation);

// Tổng hợp số lượng theo nhóm máu + trạng thái, tính ở DB (không tải hết record về) - đặt TRƯỚC "/:id"
router.get("/summary", authorize("CENTRAL", "HOSPITAL"), getBloodUnitSummary);

// FR-09 (CENTRAL - toàn quyền) + FR-19 (HOSPITAL - chỉ xem tồn kho của bệnh viện mình), có phân trang
router.get("/", authorize("CENTRAL", "HOSPITAL"), getBloodUnits);
router.get("/:id", authorize("CENTRAL", "HOSPITAL"), getBloodUnitById);

// HOSPITAL tự xử lý đơn vị máu tại viện mình - không cần qua CENTRAL cho các việc thuộc quyền của họ
router.put("/:id/use", authorize("HOSPITAL"), useBloodUnit);
router.put("/:id/discard", authorize("HOSPITAL"), discardBloodUnit);

// Chỉ CENTRAL được thêm/sửa/xoá - HOSPITAL chỉ xem (đúng FR-09, không đổi quyền quản lý)
router.post("/", authorize("CENTRAL"), createBloodUnit);
router.put("/:id", authorize("CENTRAL"), updateBloodUnit);
router.delete("/:id", authorize("CENTRAL"), deleteBloodUnit);

module.exports = router;
