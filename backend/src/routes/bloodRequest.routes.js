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

router.get("/", authorize("HOSPITAL", "CENTRAL"), getBloodRequests);
router.get("/:id", authorize("HOSPITAL", "CENTRAL"), getBloodRequestById);

router.post("/", authorize("HOSPITAL"), createBloodRequest);

router.put("/:id", authorize("CENTRAL"), updateBloodRequest);
router.delete("/:id", authorize("CENTRAL"), deleteBloodRequest);

router.put("/:id/decision", authorize("CENTRAL"), decideBloodRequest);
router.put("/:id/receive", authorize("HOSPITAL"), receiveBloodRequest);

module.exports = router;
