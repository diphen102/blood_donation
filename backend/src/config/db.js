const mongoose = require("mongoose");
const dns = require("node:dns");

// Một số mạng (đặc biệt ở VN: trường học, công ty, 1 số nhà mạng) chặn hoặc không hỗ trợ
// truy vấn DNS dạng SRV mà connection string "mongodb+srv://" cần dùng, gây lỗi:
//   querySrv ECONNREFUSED _mongodb._tcp....mongodb.net
// Ép Node dùng thẳng DNS công cộng (Google/Cloudflare) ở tầng ứng dụng để không phụ thuộc
// cấu hình DNS của hệ điều hành/router.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI chưa được cấu hình trong file .env");
  }
  await mongoose.connect(uri);
  console.log(`[MongoDB] Đã kết nối: ${mongoose.connection.name}`);
}

module.exports = connectDB;
