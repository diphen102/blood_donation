import { useEffect, useState } from "react";
import { Button, Modal, Typography, Table, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, message, Row, Col, Card, Alert } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, NodeIndexOutlined, SearchOutlined } from "@ant-design/icons";
import { bloodUnitApi, hospitalApi, donationApi } from "../../api/resourceApis";
import { ALL_STATUS_OPTIONS } from "../../constants/bloodUnitStatus";
import { TEST_FAIL_REASONS, TEST_RECOMMENDATIONS } from "../../constants/testResult";
import BloodUnitJourney from "../../components/BloodUnitJourney";

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));
const STATUS_TAG_COLOR = { COLLECTED: "default", TESTED: "blue", STORED: "cyan", DISPATCHED: "gold", RECEIVED: "green", USED: "purple", DISCARDED: "red" };

export default function BloodUnitPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [bloodGroupFilter, setBloodGroupFilter] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [donationOptions, setDonationOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [journeyUnit, setJourneyUnit] = useState(null);
  const [form] = Form.useForm();

  function load() {
    setLoading(true);
    bloodUnitApi
      .list({ page, limit: pageSize, status: statusFilter, bloodGroup: bloodGroupFilter, search: searchText || undefined })
      .then((res) => {
        setData(res.data.items);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }

  function loadSummary() {
    bloodUnitApi.summary().then((res) => setSummary(res.data));
  }

  useEffect(load, [page, pageSize, statusFilter, bloodGroupFilter, searchText]);
  useEffect(() => {
    loadSummary();
    hospitalApi.list().then((res) => setHospitalOptions(res.data.map((h) => ({ value: h._id, label: h.name }))));
    donationApi.list().then((res) => {
      setDonationOptions(
        res.data.map((d) => ({
          value: d._id,
          label: `${d.donorId?.fullName || d.donorId} — ${d.donationDate ? new Date(d.donationDate).toLocaleDateString("vi-VN") : ""}`,
        }))
      );
    });
  }, []);

  function openCreate() {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record) {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      donationId: record.donationId?._id || record.donationId,
      currentHospital: record.currentHospital?._id || record.currentHospital,
    });
    setModalOpen(true);
  }

  async function handleDelete(record) {
    await bloodUnitApi.remove(record._id);
    message.success("Đã xoá.");
    load();
    loadSummary();
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      if (values.testResult !== "FAILED") {
        values.testFailReason = null;
        values.testRecommendation = null;
      } else {
        values.testFailReason = values.testFailReason === "Khác (tự nhập)" ? values.testFailReasonCustom : values.testFailReason;
        values.testRecommendation = values.testRecommendation === "Khác (tự nhập)" ? values.testRecommendationCustom : values.testRecommendation;
      }
      delete values.testFailReasonCustom;
      delete values.testRecommendationCustom;

      if (editingRecord) {
        await bloodUnitApi.update(editingRecord._id, values);
        message.success("Đã cập nhật.");
      } else {
        await bloodUnitApi.create(values);
        message.success("Đã thêm mới.");
      }
      setModalOpen(false);
      load();
      loadSummary();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  }

  function handleTableChange(pagination, filters) {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    setStatusFilter(filters.status?.[0]);
    setBloodGroupFilter(filters.bloodGroup?.[0]);
  }

  function handleSearch(value) {
    setPage(1);
    setSearchText(value);
  }

  const columns = [
    { title: "Mã đơn vị", dataIndex: "code" },
    {
      title: "Nhóm máu", dataIndex: "bloodGroup",
      filters: BLOOD_GROUP_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      filterMultiple: false,
    },
    { title: "Thể tích (ml)", dataIndex: "volume" },
    {
      title: "Trạng thái", dataIndex: "status",
      filters: ALL_STATUS_OPTIONS.map((o) => ({ text: o.value, value: o.value })),
      filterMultiple: false,
      render: (s) => <Tag color={STATUS_TAG_COLOR[s]}>{s}</Tag>,
    },
    {
      title: "Đang ở", dataIndex: "currentHospital",
      render: (h) => (h && typeof h === "object" ? h.name : h || "Kho BVTW"),
    },
    { title: "Khoa sử dụng", dataIndex: "department", render: (d) => d || "-" },
    {
      title: "Hành trình", key: "journey", width: 100,
      render: (_, record) => <Button size="small" icon={<NodeIndexOutlined />} onClick={() => setJourneyUnit(record)} />,
    },
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

  const availableByGroup = summary
    ? Object.entries(summary).map(([group, byStatus]) => [group, byStatus.STORED || 0]).filter(([, n]) => n > 0)
    : [];
  const availableTotal = availableByGroup.reduce((sum, [, n]) => sum + n, 0);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} className="app-heading" style={{ margin: 0 }}>Đơn vị máu</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </div>

      <Card size="small" style={{ marginBottom: 16 }} title="Sẵn sàng sử dụng / điều phối đi bệnh viện khác (trạng thái STORED)">
        {!summary ? (
          <Typography.Text type="secondary">Đang tải...</Typography.Text>
        ) : availableTotal === 0 ? (
          <Typography.Text type="secondary">Hiện chưa có đơn vị máu nào ở trạng thái STORED.</Typography.Text>
        ) : (
          <Row gutter={[12, 8]}>
            {availableByGroup.map(([group, count]) => (
              <Col key={group}>
                <Tag color="#8E2430" style={{ fontSize: 14, padding: "4px 12px" }}>{group}: {count} đơn vị</Tag>
              </Col>
            ))}
            <Col><Tag style={{ fontSize: 14, padding: "4px 12px" }}>Tổng: {availableTotal} đơn vị</Tag></Col>
          </Row>
        )}
      </Card>

      <Input.Search
        allowClear
        placeholder="Tìm theo mã đơn vị... (Enter để tìm)"
        prefix={<SearchOutlined />}
        onSearch={handleSearch}
        className="app-search-input"
        style={{ maxWidth: 320, marginBottom: 16 }}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
      />

      <Modal
        title={editingRecord ? "Sửa đơn vị máu" : "Thêm đơn vị máu"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Cập nhật" : "Thêm"}
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingRecord && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Thông thường không cần thêm thủ công ở đây — khi ghi nhận 1 lần hiến máu ở trang Lịch sử hiến máu, hệ thống đã tự tạo đơn vị máu tương ứng. Chỉ dùng form này cho trường hợp đặc biệt (VD: nhập bù dữ liệu cũ)."
            />
          )}
          <Form.Item name="code" label="Mã đơn vị máu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bloodGroup" label="Nhóm máu" rules={[{ required: true }]}>
            <Select options={BLOOD_GROUP_OPTIONS} />
          </Form.Item>
          <Form.Item name="volume" label="Thể tích (ml)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="donationId" label="Lần hiến máu gốc" rules={[{ required: true }]}>
            <Select options={donationOptions} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select options={ALL_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="currentHospital" label="Đang lưu tại bệnh viện">
            <Select options={hospitalOptions} allowClear />
          </Form.Item>

          <Form.Item name="department" label="Khoa sử dụng (nếu đã dùng cho bệnh nhân)">
            <Input placeholder="VD: Khoa Cấp cứu" />
          </Form.Item>

          <Form.Item name="testResult" label="Kết quả xét nghiệm">
            <Select allowClear options={[{ value: "PASSED", label: "Đạt" }, { value: "FAILED", label: "Không đạt" }]} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.testResult !== cur.testResult}>
            {({ getFieldValue }) =>
              getFieldValue("testResult") === "FAILED" ? (
                <>
                  <Form.Item name="testFailReason" label="Lý do không đạt" rules={[{ required: true, message: "Chọn hoặc nhập lý do" }]}>
                    <Select options={TEST_FAIL_REASONS.map((r) => ({ value: r, label: r }))} />
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate={(p, c) => p.testFailReason !== c.testFailReason}>
                    {({ getFieldValue: g2 }) =>
                      g2("testFailReason") === "Khác (tự nhập)" ? (
                        <Form.Item name="testFailReasonCustom" label="Nhập lý do cụ thể" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>

                  <Form.Item name="testRecommendation" label="Khuyến nghị cho người hiến" rules={[{ required: true, message: "Chọn hoặc nhập khuyến nghị" }]}>
                    <Select options={TEST_RECOMMENDATIONS.map((r) => ({ value: r, label: r }))} />
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate={(p, c) => p.testRecommendation !== c.testRecommendation}>
                    {({ getFieldValue: g3 }) =>
                      g3("testRecommendation") === "Khác (tự nhập)" ? (
                        <Form.Item name="testRecommendationCustom" label="Nhập khuyến nghị cụ thể" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!journeyUnit}
        onCancel={() => setJourneyUnit(null)}
        footer={null}
        title={journeyUnit ? `Hành trình đơn vị máu ${journeyUnit.code}` : ""}
      >
        {journeyUnit && <BloodUnitJourney unit={journeyUnit} />}
      </Modal>
    </div>
  );
}
