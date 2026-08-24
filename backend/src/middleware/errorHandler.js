// Bắt lỗi tập trung - đặt cuối cùng trong app.js
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `Giá trị của '${field}' đã tồn tại.` });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join("; ") });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: `ID không hợp lệ: ${err.value}` });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || "Lỗi máy chủ nội bộ.",
  });
}

module.exports = errorHandler;
