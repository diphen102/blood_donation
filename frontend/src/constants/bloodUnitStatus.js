export const STATUS_STEPS = [
  { value: "COLLECTED", label: "Thu thập tại BVTW Huế" },
  { value: "TESTED", label: "Xét nghiệm" },
  { value: "STORED", label: "Lưu trữ tại kho" },
  { value: "DISPATCHED", label: "Điều phối đến bệnh viện" },
  { value: "RECEIVED", label: "Bệnh viện đã tiếp nhận" },
  { value: "USED", label: "Sử dụng cho bệnh nhân" },
];

// DISCARDED là nhánh rẽ (xét nghiệm không đạt), không nằm trong luồng chính ở trên
export const ALL_STATUS_OPTIONS = [...STATUS_STEPS.map((s) => ({ value: s.value, label: s.value })), { value: "DISCARDED", label: "DISCARDED (huỷ - không đạt xét nghiệm)" }];
