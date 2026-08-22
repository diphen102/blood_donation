import { useState } from "react";
import { Form, Input, Button, Typography, Alert, message } from "antd";
import { UserOutlined, LockOutlined, IdcardOutlined, PhoneOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
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

export default function Register() {
  const navigate = useNavigate();
  const { setUserFromAuthResponse } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values) {
    setError("");
    setSubmitting(true);
    try {
      const res = await authApi.register(values);
      // Đăng ký xong đăng nhập luôn cho người dùng, không bắt quay lại trang Login nhập tay lần nữa.
      setUserFromAuthResponse(res.data);
      message.success(res.data.message || "Đăng ký thành công.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại.");
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
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MedicalCrossIcon />
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <Typography.Text strong style={{ fontSize: 15, display: "block" }}>Hệ thống Hiến máu</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Bệnh viện Trung ương Huế</Typography.Text>
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${colors.border}`, padding: "28px 28px 24px" }}>
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 6 }}>Đăng ký tài khoản</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 20 }}>
            Dành cho người hiến máu. Nếu bạn từng hiến máu tại BVTW Huế, nhập đúng CCCD và số điện thoại đã đăng ký lúc hiến máu để tự động liên kết với hồ sơ và lịch sử hiến máu có sẵn.
          </Typography.Paragraph>

          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}>
              <Input prefix={<UserOutlined style={{ color: "#9CA3AF" }} />} autoFocus />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
              <Input.Password prefix={<LockOutlined style={{ color: "#9CA3AF" }} />} />
            </Form.Item>
            <Form.Item name="cccd" label="Số CCCD" rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}>
              <Input prefix={<IdcardOutlined style={{ color: "#9CA3AF" }} />} />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
              <Input prefix={<PhoneOutlined style={{ color: "#9CA3AF" }} />} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", textAlign: "center", marginTop: 16 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </Typography.Text>
      </div>
    </div>
  );
}
