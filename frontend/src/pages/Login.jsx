import { useState } from "react";
import { Form, Input, Button, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

function MedicalCrossIcon({ size = 22, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="20" fill={color} />
      <rect x="2" y="9" width="20" height="6" fill={color} />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values) {
    setError("");
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.paper,
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MedicalCrossIcon />
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <Typography.Text strong style={{ fontSize: 15, display: "block" }}>Hệ thống Hiến máu</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Bệnh viện Trung ương Huế</Typography.Text>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${colors.border}`,
            padding: "28px 28px 24px",
          }}
        >
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>Đăng nhập</Typography.Title>

          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}>
              <Input prefix={<UserOutlined style={{ color: "#9CA3AF" }} />} placeholder="username" autoFocus />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
              <Input.Password prefix={<LockOutlined style={{ color: "#9CA3AF" }} />} placeholder="••••••••" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", textAlign: "center", marginTop: 16 }}>
          Là người hiến máu và chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </Typography.Text>
      </div>
    </div>
  );
}
