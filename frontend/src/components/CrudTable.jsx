import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, Popconfirm, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

/**
 * Component CRUD dùng chung cho Donor / Donation / Hospital / BloodUnit.
 * Cả các module đều theo đúng 1 khuôn mẫu: bảng danh sách + modal thêm/sửa + xoá có xác nhận,
 * nên gom về đây để không lặp code, mỗi trang chỉ cần khai báo columns + formFields riêng.
 */
export default function CrudTable({ title, api, columns, formFields, searchableFields = [] }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list();
      setData(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || `Không tải được danh sách ${title}.`);
    } finally {
      setLoading(false);
    }
  }, [api, title]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record) {
    setEditingRecord(record);
    const formValues = { ...record };
    formFields.forEach((f) => {
      if (f.type === "date" && formValues[f.name]) {
        formValues[f.name] = dayjs(formValues[f.name]);
      }
      if (f.type === "select" && formValues[f.name] && typeof formValues[f.name] === "object") {
        formValues[f.name] = formValues[f.name]._id;
      }
    });
    form.setFieldsValue(formValues);
    setModalOpen(true);
  }

  async function handleDelete(record) {
    try {
      await api.remove(record._id);
      message.success("Đã xoá.");
      loadData();
    } catch (err) {
      message.error(err.response?.data?.message || "Xoá thất bại.");
    }
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      formFields.forEach((f) => {
        if (f.type === "date" && payload[f.name]) {
          payload[f.name] = payload[f.name].format("YYYY-MM-DD");
        }
      });

      if (editingRecord) {
        await api.update(editingRecord._id, payload);
        message.success("Đã cập nhật.");
      } else {
        await api.create(payload);
        message.success("Đã thêm mới.");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  }

  const tableColumns = [
    ...columns,
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title={`Xoá bản ghi này?`} onConfirm={() => handleDelete(record)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  const filteredData =
    searchText && searchableFields.length > 0
      ? data.filter((record) =>
          searchableFields.some((field) => {
            const value = getPath(record, field);
            return value != null && String(value).toLowerCase().includes(searchText.toLowerCase());
          })
        )
      : data;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} className="app-heading" style={{ margin: 0 }}>{title}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      {searchableFields.length > 0 && (
        <Input
          allowClear
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="app-search-input"
          style={{ maxWidth: 320, marginBottom: 16 }}
        />
      )}

      <Table
        rowKey="_id"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
      />

      <Modal
        title={editingRecord ? `Sửa ${title}` : `Thêm ${title}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Cập nhật" : "Thêm"}
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {formFields.map((f) => (
            <Form.Item key={f.name} name={f.name} label={f.label} rules={f.rules || [{ required: true, message: `Vui lòng nhập ${f.label}` }]}>
              {f.type === "number" && <InputNumber style={{ width: "100%" }} />}
              {f.type === "date" && <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />}
              {f.type === "select" && <Select options={f.options} />}
              {(!f.type || f.type === "text") && <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
