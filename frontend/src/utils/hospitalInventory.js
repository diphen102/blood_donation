// Tính tồn kho đơn vị máu tại 1 bệnh viện, theo từng nhóm máu.
// "available" = đang RECEIVED (đã nhận, chưa dùng) - đây mới là số THỰC SỰ còn dùng được.
// "total" = mọi trạng thái (kể cả DISPATCHED đang trên đường tới, USED đã dùng...) - chỉ để tham khảo.
export function summarizeHospitalInventory(units) {
  const map = {};
  units.forEach((u) => {
    if (!map[u.bloodGroup]) map[u.bloodGroup] = { available: 0, total: 0 };
    map[u.bloodGroup].total += 1;
    if (u.status === "RECEIVED") map[u.bloodGroup].available += 1;
  });
  return map;
}

// Giống summarizeHospitalInventory nhưng nhận thẳng kết quả từ GET /blood-units/summary
// (đã tổng hợp sẵn ở tầng MongoDB) thay vì phải tải toàn bộ danh sách record về tính tay -
// bắt buộc phải dùng cách này khi kho có thể lên tới hàng nghìn đơn vị.
export function summarizeFromAggregation(summaryData) {
  const map = {};
  Object.entries(summaryData || {}).forEach(([bloodGroup, byStatus]) => {
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    map[bloodGroup] = { available: byStatus.RECEIVED || 0, total };
  });
  return map;
}
