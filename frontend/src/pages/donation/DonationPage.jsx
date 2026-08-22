import { useEffect, useState } from "react";
import { Typography, Table, Button, Modal, Form, Select, DatePicker, Input, InputNumber, Tag, Space, Popconfirm, message, Alert } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { donationApi, donorApi } from "../../api/resourceApis";
import { DONATION_TYPE_LABELS, DONATION_TYPE_OPTIONS, DONATION_DEFAULT_VOLUME } from "../../constants/donationType";

export default function DonationPage() {
  const [data, setData] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  function load() {
    setLoading(true);
    donationApi.list().then((res) => setData(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    donorApi.list().then((res) => setDonors(res.data));
  }, []);

  const donorOptions = donors.map((d) => ({ value: d._id, label: `${d.fullName} — ${d.cccd} (nhóm ${d.bloodGroup})` }));
  const watchedDonorId = Form.useWatch("donorId", createForm);
  const selectedDonor = donors.find((d) => d._id === watchedDonorId);
  const selectedType = Form.useWatch("donationType", createForm) || "WHOLE_BLOOD";

  function openCreate() {
    createForm.resetFields();
    createForm.setFieldsValue({ donationType: "WHOLE_BLOOD", volume: DONATION_DEFAULT_VOLUME.WHOLE_BLOOD, donationDate: dayjs() });
    setCreateOpen(true);
  }

  function openEdit(record) {
    setEditingRecord(record);
    editForm.setFieldsValue({ ...record, donationDate: dayjs(record.donationDate) });
  }

  async function handleCreate() {
    try {
      const values = await createForm.validateFields();
      const payload = { ...values, donationDate: values.donationDate.format("YYYY-MM-DD") };
      const res = await donationApi.create(payload);
      const { bloodUnit, nextEligibleDate } = res.data;
      message.success(
        `Đã ghi nhận lần hiến máu và tự tạo đơn vị máu ${bloodUnit.code}. Người hiến có thể hiến lại từ ${new Date(nextEligibleDate).toLocaleDateString("vi-VN")}.`,
        6
      );
      setCreateOpen(false);
      load();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  }

  async function handleEditSubmit() {
    try {
      const values = await editForm.validateFields();
      const payload = { ...values, donationDate: values.donationDate.format("YYYY-MM-DD") };
      delete payload.donorId;
      await donationApi.update(editingRecord._id, payload);
      message.success("Đã cập nhật.");
      setEditingRecord(null);
      load();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  }

  async function handleDelete(record) {
    await donationApi.remove(record._id);
    message.success("Đã xoá.");
    load();
  }

  const filteredData = searchText
    ? data.filter((d) => {
        const donor = d.donorId;
        const name = donor && typeof donor === "object" ? `${donor.fullName} ${donor.cccd}` : "";
        return name.toLowerCase().includes(searchText.toLowerCase()) || (d.location || "").toLowerCase().includes(searchText.toLowerCase());
      })
    : data;

  const columns = [
    {
      title: "Người hiến", dataIndex: "donorId",
      render: (donor) => (donor && typeof donor === "object" ? `${donor.fullName} (${donor.bloodGroup || ""})` : donor),
    },
    {
      title: "Loại hiến", dataIndex: "donationType",
      filters: DONATION_TYPE_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (v, r) => r.donationType === v,
      render: (t) => <Tag>{DONATION_TYPE_LABELS[t] || t}</Tag>,
    },
    { title: "Ngày hiến", dataIndex: "donationDate", render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "") },
    { title: "Địa điểm", dataIndex: "location" },
    {
      title: "Thao tác", key: "actions", width: 110,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xoá bản ghi này?" onConfirm={() => handleDelete(record)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} className="app-heading" style={{ margin: 0 }}>Lịch sử hiến máu</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Ghi nhận lần hiến máu</Button>
      </div>

      <Input
        allowClear
        placeholder="Tìm theo tên người hiến, CCCD, địa điểm..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="app-search-input"
        style={{ maxWidth: 360, marginBottom: 16 }}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
      />

      <Modal
        title="Ghi nhận lần hiến máu"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        okText="Ghi nhận"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Hệ thống sẽ tự tạo 1 đơn vị máu tương ứng ngay sau khi ghi nhận — không cần thao tác thêm ở trang Đơn vị máu."
        />
        <Form form={createForm} layout="vertical">
          <Form.Item name="donorId" label="Người hiến máu" rules={[{ required: true }]}>
            <Select options={donorOptions} showSearch optionFilterProp="label" />
          </Form.Item>

          {selectedDonor && (
            <Alert
              type="success"
              style={{ marginBottom: 16 }}
              message={`Nhóm máu: ${selectedDonor.bloodGroup} (tự động lấy từ hồ sơ, không cần nhập tay)`}
            />
          )}

          <Form.Item name="donationType" label="Loại hiến máu" rules={[{ required: true }]}>
            <Select
              options={DONATION_TYPE_OPTIONS}
              onChange={(val) => createForm.setFieldValue("volume", DONATION_DEFAULT_VOLUME[val])}
            />
          </Form.Item>

          <Form.Item name="donationDate" label="Ngày hiến máu" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="location" label="Địa điểm" rules={[{ required: true }]}>
            <Input placeholder="VD: BVTW Huế" />
          </Form.Item>

          <Form.Item name="volume" label={`Thể tích (ml) - mặc định theo loại ${DONATION_TYPE_LABELS[selectedType]}, có thể sửa`} rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item name="unitCode" label="Mã đơn vị máu (để trống sẽ tự sinh)">
            <Input placeholder="Để trống để hệ thống tự đặt mã" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Sửa lần hiến máu"
        open={!!editingRecord}
        onOk={handleEditSubmit}
        onCancel={() => setEditingRecord(null)}
        okText="Cập nhật"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="donationType" label="Loại hiến máu" rules={[{ required: true }]}>
            <Select options={DONATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="donationDate" label="Ngày hiến máu" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="location" label="Địa điểm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
