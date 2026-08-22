const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getBloodRequests,
  getBloodRequestById,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  decideBloodRequest,
  receiveBloodRequest,
} = require("../controllers/bloodRequest.controller");

const router = express.Router();

router.use(authenticate);

// FR-17 (HOSPITAL xem của mình) + FR-11 (CENTRAL xem tất cả)
router.get("/", authorize("HOSPITAL", "CENTRAL"), getBloodRequests);
router.get("/:id", authorize("HOSPITAL", "CENTRAL"), getBloodRequestById);

// FR-16: HOSPITAL tạo yêu cầu
router.post("/", authorize("HOSPITAL"), createBloodRequest);

// CRUD cơ bản tuần 3: CENTRAL cập nhật/xoá. Endpoint duyệt yêu cầu riêng biệt sẽ làm ở tuần 5.
router.put("/:id", authorize("CENTRAL"), updateBloodRequest);
router.delete("/:id", authorize("CENTRAL"), deleteBloodRequest);

// Tuần 5 - tính năng đặc trưng: duyệt yêu cầu (FR-11 + điều phối FR-12), xác nhận nhận (FR-18)
router.put("/:id/decision", authorize("CENTRAL"), decideBloodRequest);
router.put("/:id/receive", authorize("HOSPITAL"), receiveBloodRequest);

module.exports = router;
