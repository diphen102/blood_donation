const express = require("express");
const { register, login, me, changePassword } = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.put("/change-password", authenticate, changePassword);

module.exports = router;
