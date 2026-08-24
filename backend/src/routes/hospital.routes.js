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

router.get("/", getHospitals);
router.get("/:id", getHospitalById);

router.post("/", authorize("CENTRAL"), createHospital);
router.put("/:id", authorize("CENTRAL"), updateHospital);
router.delete("/:id", authorize("CENTRAL"), deleteHospital);

module.exports = router;
