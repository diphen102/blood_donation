import { useEffect, useState } from "react";
import { Typography, Table, Button, Tag, Switch, Modal, Form, Input, Select, Space, Popconfirm, message, Alert } from "antd";
import { PlusOutlined, KeyOutlined, CopyOutlined } from "@ant-design/icons";
import { userApi, hospitalApi } from "../../api/resourceApis";

const ROLE_OPTIONS = ["ADMIN", "CENTRAL", "HOSPITAL"].map((v) => ({ value: v, label: v }));
const ALL_ROLES = ["ADMIN", "CENTRAL", "HOSPITAL", "DONOR"];

export default function UserPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [form] = Form.useForm();

  function load() {
    setLoading(true);
    userApi.list().then((res) => setData(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    hospitalApi.list().then((res) => setHospitalOptions(res.data.map((h) => ({ value: h._id, label: h.name }))));
  }, []);

  async function handleToggle(record) {
    try {
      await userApi.toggleActive(record._id);
      message.success("Đã cập nhật trạng thái tài khoản.");
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại.");
    }
  }

  async function handleResetPassword(record) {
    try {
      const res = await userApi.resetPassword(record._id);
      setResetResult({ username: res.data.username, tempPassword: res.data.tempPassword });
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại.");
    }
  }

  async function handleCreate() {
    try {
      const values = await form.validateFields();
      await userApi.create(values);
      message.success("Đã tạo tài khoản.");
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Tạo tài khoản thất bại.");
    }
  }

  const columns = [
    { title: "Username", dataIndex: "username" },
    {
      title: "Vai trò", dataIndex: "role",
      filters: ALL_ROLES.map((r) => ({ text: r, value: r })),
      onFilter: (v, r) => r.role === v,
      render: (r) => <Tag>{r}</Tag>,
    },
    { title: "Bệnh viện", dataIndex: "hospitalId", render: (h) => (h ? h.name : "-") },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      render: (active, record) => <Switch checked={active} onChange={() => handleToggle(record)} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Đặt lại mật khẩu cho tài khoản này?"
          description="Chỉ nên làm khi đã xác nhận đúng danh tính người dùng (điện thoại/gặp trực tiếp) — hệ thống chưa có OTP để tự xác thực."
          onConfirm={() => handleResetPassword(record)}
          okText="Đặt lại"
          cancelText="Huỷ"
        >
          <Button size="small" icon={<KeyOutlined />}>Đặt lại mật khẩu</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Quản lý tài khoản</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tạo tài khoản</Button>
      </div>

      <Table rowKey="_id" columns={columns} dataSource={data} loading={loading} scroll={{ x: "max-content" }} pagination={{ pageSize: 10 }} />

      <Modal title="Tạo tài khoản" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} okText="Tạo" cancelText="Huỷ" destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
            {({ getFieldValue }) =>
              getFieldValue("role") === "HOSPITAL" ? (
                <Form.Item name="hospitalId" label="Bệnh viện" rules={[{ required: true, message: "Tài khoản HOSPITAL cần chọn bệnh viện" }]}>
                  <Select options={hospitalOptions} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mật khẩu tạm đã được tạo"
        open={!!resetResult}
        onCancel={() => setResetResult(null)}
        footer={<Button type="primary" onClick={() => setResetResult(null)}>Đã ghi lại, đóng</Button>}
      >
        {resetResult && (
          <>
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Mật khẩu này chỉ hiển thị 1 LẦN DUY NHẤT ở đây. Hệ thống không tự gửi SMS/email — hãy báo trực tiếp cho người dùng (điện thoại/gặp mặt) rồi đóng hộp thoại này."
            />
            <Typography.Text>Tài khoản: <b>{resetResult.username}</b></Typography.Text>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <Input readOnly value={resetResult.tempPassword} style={{ fontFamily: "monospace", fontSize: 16 }} />
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.tempPassword);
                  message.success("Đã copy.");
                }}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
