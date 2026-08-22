import { useEffect, useState } from "react";
import { Typography, Table, Button, Modal, Form, Select, InputNumber, Input, Tag, Space, Popconfirm, message } from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined, InboxOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { bloodRequestApi } from "../../api/resourceApis";

const STATUS_COLOR = { PENDING: "gold", APPROVED: "blue", REJECTED: "red", COMPLETED: "green" };
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));

export default function BloodRequestPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  function load() {
    setLoading(true);
    bloodRequestApi.list().then((res) => setData(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    try {
      const values = await form.validateFields();
      await bloodRequestApi.create(values);
      message.success("Đã tạo yêu cầu.");
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Tạo yêu cầu thất bại.");
    }
  }

  async function handleDecision(record, action) {
    try {
      await bloodRequestApi.decide(record._id, action);
      message.success(action === "APPROVED" ? "Đã duyệt và điều phối đơn vị máu." : "Đã từ chối yêu cầu.");
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại.");
    }
  }

  async function handleReceive(record) {
    try {
      await bloodRequestApi.receive(record._id);
      message.success("Đã xác nhận nhận đơn vị máu.");
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại.");
    }
  }

  const baseColumns = [
    { title: "Bệnh viện", dataIndex: "hospitalId", render: (h) => (h && typeof h === "object" ? h.name : h) },
    {
      title: "Nhóm máu",
      dataIndex: "bloodGroup",
      filters: BLOOD_GROUPS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.bloodGroup === value,
    },
    { title: "Số lượng", dataIndex: "quantity" },
    { title: "Lý do", dataIndex: "reason", ellipsis: true },
    {
      title: "Trạng thái",
      dataIndex: "status",
      filters: Object.keys(STATUS_COLOR).map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
      render: (s) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
    },
  ];

  const actionColumn = {
    title: "Thao tác",
    key: "actions",
    width: 220,
    render: (_, record) => {
      if (user.role === "CENTRAL" && record.status === "PENDING") {
        return (
          <Space>
            <Popconfirm title="Duyệt yêu cầu này? Hệ thống sẽ tự điều phối đơn vị máu phù hợp." onConfirm={() => handleDecision(record, "APPROVED")} okText="Duyệt" cancelText="Huỷ">
              <Button size="small" type="primary" icon={<CheckOutlined />}>Duyệt</Button>
            </Popconfirm>
            <Popconfirm title="Từ chối yêu cầu này?" onConfirm={() => handleDecision(record, "REJECTED")} okText="Từ chối" cancelText="Huỷ">
              <Button size="small" danger icon={<CloseOutlined />}>Từ chối</Button>
            </Popconfirm>
          </Space>
        );
      }
      if (user.role === "HOSPITAL" && record.status === "APPROVED") {
        return (
          <Popconfirm title="Xác nhận đã nhận đủ đơn vị máu?" onConfirm={() => handleReceive(record)} okText="Xác nhận" cancelText="Huỷ">
            <Button size="small" icon={<InboxOutlined />}>Xác nhận đã nhận</Button>
          </Popconfirm>
        );
      }
      return null;
    },
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Yêu cầu tiếp nhận máu</Typography.Title>
        {user.role === "HOSPITAL" && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tạo yêu cầu</Button>
        )}
      </div>

      <Table
        rowKey="_id"
        columns={[...baseColumns, actionColumn]}
        dataSource={data}
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
      />

      <Modal title="Tạo yêu cầu tiếp nhận máu" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} okText="Gửi yêu cầu" cancelText="Huỷ" destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="bloodGroup" label="Nhóm máu cần" rules={[{ required: true }]}>
            <Select options={BLOOD_GROUPS} />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng đơn vị" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reason" label="Lý do" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
