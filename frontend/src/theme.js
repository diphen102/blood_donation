// Bảng màu "Institutional Red" — đỏ trầm, thu gọn, lấy tinh thần từ các hệ thống HIS/quản lý
// bệnh viện thật (bảng màu it sắc độ, phẳng, không gradient) thay vì phong cách "AI dashboard".
export const colors = {
  primary: "#8E2430",      // đỏ trầm (burgundy), không phải đỏ tươi
  primaryDark: "#6B1B24",
  primaryLight: "#F3E7E8", // dùng cho nền badge/hover nhạt, không dùng làm nền lớn
  ink: "#1F2937",          // xám than cho sidebar - trung tính, không "đen tuyền"
  border: "#D9DCE1",
  paper: "#F4F5F7",        // nền trang xám nhạt trung tính (không ám màu đỏ)
  success: "#2F7D4F",
  warning: "#B4790A",
  info: "#39597A",
  danger: "#A33A3A",
};

export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorLink: colors.primary,
    borderRadius: 4,          // phẳng hơn - phần mềm nghiệp vụ thật ít khi bo tròn to
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    colorBgLayout: colors.paper,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: colors.ink,
      headerBg: "#FFFFFF",   // header trắng có viền dưới, không dùng nền đỏ lớn (đỡ "app tiêu dùng")
      bodyBg: colors.paper,
    },
    Menu: {
      darkItemBg: colors.ink,
      darkItemSelectedBg: colors.primary,
      darkItemHoverBg: "#2A3444",
      itemBorderRadius: 4,
    },
    Card: {
      borderRadiusLG: 6,
    },
    Button: {
      borderRadius: 4,
      fontWeight: 500,
    },
    Table: {
      borderRadius: 4,
      headerBg: "#EDEEF1",
    },
  },
};
