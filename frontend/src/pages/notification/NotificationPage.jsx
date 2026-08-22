import { useEffect, useState } from "react";
import { Typography, Button, Table, Modal, Form, Input, Select, Space, Popconfirm, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { notificationApi } from "../../api/resourceApis";
import { userApi } from "../../api/resourceApis";

export default function NotificationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [donorOptions, setDonorOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  function load() {
    setLoading(true);
    notificationApi.list().then((res) => setData(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    userApi.list().then((res) => {
      const donors = res.data.filter((u) => u.role === "DONOR");
      setDonorOptions([
        { value: "", label: "— Gửi cho tất cả người hiến (broadcast) —" },
        ...donors.map((d) => ({ value: d._id, label: d.username })),
      ]);
    });
  }, []);

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      await notificationApi.create({ ...values, receiverId: values.receiverId || undefined });
      message.success("Đã gửi thông báo.");
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Gửi thất bại.");
    }
  }

  async function handleDelete(record) {
    await notificationApi.remove(record._id);
    message.success("Đã xoá.");
    load();
  }

  const columns = [
    { title: "Tiêu đề", dataIndex: "title" },
    { title: "Nội dung", dataIndex: "content", ellipsis: true },
    {
      title: "Người nhận",
      dataIndex: "receiverId",
      render: (r) => (r ? r.username || r : "Tất cả (broadcast)"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Popconfirm title="Xoá thông báo này?" onConfirm={() => handleDelete(record)} okText="Xoá" cancelText="Huỷ">
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Thông báo</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Soạn thông báo mới</Button>
      </div>
      <Table rowKey="_id" columns={columns} dataSource={data} loading={loading} scroll={{ x: "max-content" }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }} />

      <Modal title="Soạn thông báo" open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText="Gửi" cancelText="Huỷ" destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="receiverId" label="Gửi cho" initialValue="">
            <Select options={donorOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
