const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getNotifications,
  getMyNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const router = express.Router();

router.use(authenticate);

router.get("/mine", authorize("DONOR"), getMyNotifications);
router.put("/:id/read", authorize("DONOR"), markAsRead);

router.get("/", authorize("CENTRAL"), getNotifications);
router.post("/", authorize("CENTRAL"), createNotification);
router.delete("/:id", authorize("CENTRAL"), deleteNotification);

module.exports = router;
