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

router.get("/for-donation/:donationId", authorize("DONOR", "CENTRAL"), getBloodUnitsForDonation);

// Đặt TRƯỚC "/:id"
router.get("/summary", authorize("CENTRAL", "HOSPITAL"), getBloodUnitSummary);

router.get("/", authorize("CENTRAL", "HOSPITAL"), getBloodUnits);
router.get("/:id", authorize("CENTRAL", "HOSPITAL"), getBloodUnitById);

router.put("/:id/use", authorize("HOSPITAL"), useBloodUnit);
router.put("/:id/discard", authorize("HOSPITAL"), discardBloodUnit);

router.post("/", authorize("CENTRAL"), createBloodUnit);
router.put("/:id", authorize("CENTRAL"), updateBloodUnit);
router.delete("/:id", authorize("CENTRAL"), deleteBloodUnit);

module.exports = router;
