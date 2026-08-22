const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getDonations,
  getMyDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} = require("../controllers/donation.controller");

const router = express.Router();

router.use(authenticate);

// FR-04: DONOR xem lịch sử hiến máu của chính mình
router.get("/mine", authorize("DONOR"), getMyDonations);

// FR-08: CENTRAL quản lý Donation
router.get("/", authorize("CENTRAL"), getDonations);
router.get("/:id", authorize("CENTRAL"), getDonationById);
router.post("/", authorize("CENTRAL"), createDonation);
router.put("/:id", authorize("CENTRAL"), updateDonation);
router.delete("/:id", authorize("CENTRAL"), deleteDonation);

module.exports = router;
