const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/banner.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getBanners);
router.get("/:id", getBannerById);

router.post("/", authorize("CENTRAL"), createBanner);
router.put("/:id", authorize("CENTRAL"), updateBanner);
router.delete("/:id", authorize("CENTRAL"), deleteBanner);

module.exports = router;
