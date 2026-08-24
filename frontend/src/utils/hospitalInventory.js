// Tính tồn kho đơn vị máu tại 1 bệnh viện, theo NHÓM MÁU và LOẠI CHẾ PHẨM (donationType) -
// tách riêng Toàn phần / Tiểu cầu / Huyết tương thay vì cộng gộp vào chung 1 con số.
// "available" = đang RECEIVED (đã nhận, chưa dùng) - đây mới là số THỰC SỰ còn dùng được.
// "total" = mọi trạng thái (kể cả DISPATCHED đang trên đường tới, USED đã dùng...) - chỉ để tham khảo.
// Trả về dạng: { [bloodGroup]: { [donationType]: { available, total } } }
export function summarizeHospitalInventory(units) {
  const map = {};
  units.forEach((u) => {
    const type = u.donationType || "WHOLE_BLOOD";
    if (!map[u.bloodGroup]) map[u.bloodGroup] = {};
    if (!map[u.bloodGroup][type]) map[u.bloodGroup][type] = { available: 0, total: 0 };
    map[u.bloodGroup][type].total += 1;
    if (u.status === "RECEIVED") map[u.bloodGroup][type].available += 1;
  });
  return map;
}

// Giống summarizeHospitalInventory nhưng nhận thẳng kết quả từ GET /blood-units/summary
// (đã tổng hợp sẵn ở tầng MongoDB, dạng { bloodGroup: { donationType: { status: count } } })
// thay vì phải tải toàn bộ danh sách record về tính tay - bắt buộc phải dùng cách này khi kho
// có thể lên tới hàng nghìn đơn vị.
export function summarizeFromAggregation(summaryData) {
  const map = {};
  Object.entries(summaryData || {}).forEach(([bloodGroup, byType]) => {
    map[bloodGroup] = {};
    Object.entries(byType).forEach(([donationType, byStatus]) => {
      const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
      map[bloodGroup][donationType] = { available: byStatus.RECEIVED || 0, total };
    });
  });
  return map;
}
