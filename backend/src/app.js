const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const donorRoutes = require("./routes/donor.routes");
const donationRoutes = require("./routes/donation.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const bloodUnitRoutes = require("./routes/bloodUnit.routes");
const bloodRequestRoutes = require("./routes/bloodRequest.routes");
const notificationRoutes = require("./routes/notification.routes");
const bannerRoutes = require("./routes/banner.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Blood Donation API đang hoạt động." });
});

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/blood-units", bloodUnitRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/users", userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.method} ${req.originalUrl}` });
});

// Error handler tập trung - luôn đặt cuối cùng
app.use(errorHandler);

module.exports = app;
