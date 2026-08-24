import { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  PictureOutlined,
  SolutionOutlined,
  SettingOutlined,
  MenuOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import ChangePasswordModal from "../components/ChangePasswordModal";

const { Header, Sider, Content } = Layout;

const MENU_ITEMS = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard", roles: ["ADMIN", "CENTRAL", "HOSPITAL", "DONOR"] },
  { key: "/donors", icon: <TeamOutlined />, label: "Người hiến máu", roles: ["CENTRAL"] },
  { key: "/donations", icon: <HeartOutlined />, label: "Lịch sử hiến máu", roles: ["CENTRAL"] },
  { key: "/hospitals", icon: <BankOutlined />, label: "Bệnh viện", roles: ["CENTRAL"] },
  { key: "/blood-units", icon: <MedicineBoxOutlined />, label: "Đơn vị máu", roles: ["CENTRAL", "HOSPITAL"] },
  { key: "/blood-requests", icon: <SolutionOutlined />, label: "Yêu cầu tiếp nhận máu", roles: ["CENTRAL", "HOSPITAL"] },
  { key: "/notifications", icon: <BellOutlined />, label: "Thông báo", roles: ["CENTRAL"] },
  { key: "/banners", icon: <PictureOutlined />, label: "Banner & Tin tức", roles: ["CENTRAL"] },
  { key: "/admin/users", icon: <SettingOutlined />, label: "Quản lý tài khoản", roles: ["ADMIN"] },
];

const ROLE_LABEL = { ADMIN: "Quản trị", CENTRAL: "BVTW Huế", HOSPITAL: "Bệnh viện", DONOR: "Người hiến máu" };

const MOBILE_BREAKPOINT = 992;

function MedicalCrossIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="20" fill={color} />
      <rect x="2" y="9" width="20" height="6" fill={color} />
    </svg>
  );
}

function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "18px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 8,
      }}
    >
      <MedicalCrossIcon />
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Hệ thống Hiến máu</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>BVTW Huế</div>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const visibleItems = useMemo(
    () => MENU_ITEMS.filter((item) => item.roles.includes(user?.role)),
    [user]
  );

  const currentTitle = useMemo(
    () => MENU_ITEMS.find((i) => i.key === location.pathname)?.label || "Dashboard",
    [location.pathname]
  );

  const userMenu = {
    items: [
      { key: "change-password", icon: <KeyOutlined />, label: "Đổi mật khẩu" },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
    ],
    onClick: ({ key }) => {
      if (key === "logout") {
        logout();
        navigate("/login");
      } else if (key === "change-password") {
        setChangePwOpen(true);
      }
    },
  };

  const menuElement = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={visibleItems.map(({ key, icon, label }) => ({ key, icon, label }))}
      onClick={({ key }) => navigate(key)}
      style={{ borderInlineEnd: "none" }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider breakpoint="lg" collapsedWidth="0" width={224}>
          <Logo />
          {menuElement}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={224}
          styles={{ body: { padding: 0, background: colors.ink }, header: { display: "none" } }}
        >
          <Logo />
          {menuElement}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: `1px solid ${colors.border}`,
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Space size={4} style={{ minWidth: 0 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            <Typography.Text
              style={{ color: "#1F2937", fontWeight: 600, fontSize: 15 }}
              ellipsis
            >
              {currentTitle}
            </Typography.Text>
          </Space>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: "pointer" }} size={8}>
              <div className="header-user-text" style={{ textAlign: "right", lineHeight: 1.2 }}>
                <div style={{ color: "#1F2937", fontWeight: 600, fontSize: 13 }}>{user?.username}</div>
                <div style={{ color: "#6B7280", fontSize: 11 }}>{ROLE_LABEL[user?.role] || user?.role}</div>
              </div>
              <Avatar style={{ backgroundColor: colors.primary, flexShrink: 0 }} icon={<UserOutlined />} />
            </Space>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>

      <ChangePasswordModal open={changePwOpen} onClose={() => setChangePwOpen(false)} />
    </Layout>
  );
}
