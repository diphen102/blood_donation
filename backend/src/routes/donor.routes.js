const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getMyDonor,
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
} = require("../controllers/donor.controller");

const router = express.Router();

router.use(authenticate);

// FR-03: DONOR xem hồ sơ cá nhân của chính mình
router.get("/me", authorize("DONOR"), getMyDonor);

// FR-07: chỉ CENTRAL được quản lý Donor
router.get("/", authorize("CENTRAL"), getDonors);
router.get("/:id", authorize("CENTRAL"), getDonorById);
router.post("/", authorize("CENTRAL"), createDonor);
router.put("/:id", authorize("CENTRAL"), updateDonor);
router.delete("/:id", authorize("CENTRAL"), deleteDonor);

module.exports = router;
