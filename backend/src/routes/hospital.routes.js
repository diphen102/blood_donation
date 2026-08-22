const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
} = require("../controllers/hospital.controller");

const router = express.Router();

router.use(authenticate);

// FR-10, FR-16, FR-19: mọi role đã đăng nhập đều cần xem danh sách bệnh viện
router.get("/", getHospitals);
router.get("/:id", getHospitalById);

// FR-10: chỉ CENTRAL được thêm/sửa/xoá bệnh viện
router.post("/", authorize("CENTRAL"), createHospital);
router.put("/:id", authorize("CENTRAL"), updateHospital);
router.delete("/:id", authorize("CENTRAL"), deleteHospital);

module.exports = router;
