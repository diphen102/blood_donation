const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { getUsers, createUser, toggleActive, updateRole, resetPassword, deleteUser } = require("../controllers/user.controller");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id/toggle-active", toggleActive);
router.put("/:id/role", updateRole);
router.put("/:id/reset-password", resetPassword);
router.delete("/:id", deleteUser);

module.exports = router;
