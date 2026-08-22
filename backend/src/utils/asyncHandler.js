// Bọc controller async để không phải try/catch lặp lại ở mỗi hàm
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
