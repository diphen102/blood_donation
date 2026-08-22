// Dùng sau middleware authenticate.
// Cách dùng: router.get("/", authenticate, authorize("CENTRAL", "ADMIN"), controller)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa xác thực." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Vai trò '${req.user.role}' không có quyền thực hiện thao tác này.`,
      });
    }
    next();
  };
}

module.exports = authorize;
