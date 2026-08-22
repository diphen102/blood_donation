require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const cors = require('cors');
app.use(cors()); // Cho phép tất cả các nguồn truy cập API

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[Server] Khởi động thất bại:", err.message);
    process.exit(1);
  }
}

start();
