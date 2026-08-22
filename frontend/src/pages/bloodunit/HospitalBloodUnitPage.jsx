import { useEffect, useState } from "react";
import { Typography, Table, Tag, Button, Input, Card, Row, Col, Modal, Space } from "antd";
import { SearchOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { bloodUnitApi } from "../../api/resourceApis";
import { ALL_STATUS_OPTIONS } from "../../constants/bloodUnitStatus";
import BloodUnitJourney from "../../components/BloodUnitJourney";
import UseBloodUnitModal from "../../components/UseBloodUnitModal";
import DiscardBloodUnitModal from "../../components/DiscardBloodUnitModal";
import { summarizeFromAggregation } from "../../utils/hospitalInventory";

const STATUS_TAG_COLOR = { COLLECTED: "default", TESTED: "blue", STORED: "cyan", DISPATCHED: "gold", RECEIVED: "green", USED: "purple", DISCARDED: "red" };
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));

export default function HospitalBloodUnitPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [bloodGroupFilter, setBloodGroupFilter] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState(null);
  const [journeyUnit, setJourneyUnit] = useState(null);
  const [usingUnit, setUsingUnit] = useState(null);
  const [discardingUnit, setDiscardingUnit] = useState(null);

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
    bloodUnitApi.summary().then((res) => setSummary(summarizeFromAggregation(res.data)));
  }

  useEffect(load, [page, pageSize, statusFilter, bloodGroupFilter, searchText]);
  useEffect(loadSummary, []);

  function refreshAfterAction() {
    load();
    loadSummary();
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

  const totalAtHospital = summary ? Object.values(summary).reduce((sum, g) => sum + g.total, 0) : 0;

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
    { title: "Khoa sử dụng", dataIndex: "department", render: (d) => d || "-" },
    {
      title: "Hành trình", key: "journey", width: 90,
      render: (_, record) => <Button size="small" icon={<NodeIndexOutlined />} onClick={() => setJourneyUnit(record)} />,
    },
    {
      title: "Thao tác", key: "actions", width: 260,
      render: (_, record) =>
        record.status === "RECEIVED" ? (
          <Space>
            <Button size="small" type="primary" onClick={() => setUsingUnit(record)}>Đã sử dụng</Button>
            <Button size="small" danger onClick={() => setDiscardingUnit(record)}>Huỷ</Button>
          </Space>
        ) : record.status === "DISPATCHED" ? (
          <Button size="small" danger onClick={() => setDiscardingUnit(record)}>Huỷ (hỏng khi vận chuyển)</Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Typography.Title level={3} className="app-heading">Đơn vị máu tại bệnh viện</Typography.Title>

      <Card size="small" style={{ marginBottom: 16 }} title="Còn lại có thể sử dụng">
        {!summary ? (
          <Typography.Text type="secondary">Đang tải...</Typography.Text>
        ) : totalAtHospital === 0 ? (
          <Typography.Text type="secondary">Chưa có đơn vị máu nào được điều phối đến bệnh viện của bạn.</Typography.Text>
        ) : (
          <>
            <Row gutter={[12, 8]}>
              {Object.entries(summary)
                .filter(([, { available }]) => available > 0)
                .map(([group, { available }]) => (
                  <Col key={group}><Tag color="#8E2430" style={{ fontSize: 14, padding: "4px 12px" }}>{group}: {available}</Tag></Col>
                ))}
            </Row>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
              Tổng cộng {totalAtHospital} đơn vị từng qua bệnh viện (kể cả đã sử dụng/huỷ).
            </Typography.Text>
          </>
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
        open={!!journeyUnit}
        onCancel={() => setJourneyUnit(null)}
        footer={null}
        title={journeyUnit ? `Hành trình đơn vị máu ${journeyUnit.code}` : ""}
      >
        {journeyUnit && <BloodUnitJourney unit={journeyUnit} />}
      </Modal>

      <UseBloodUnitModal unit={usingUnit} onClose={() => setUsingUnit(null)} onDone={() => { setUsingUnit(null); refreshAfterAction(); }} />
      <DiscardBloodUnitModal unit={discardingUnit} onClose={() => setDiscardingUnit(null)} onDone={() => { setDiscardingUnit(null); refreshAfterAction(); }} />
    </div>
  );
}
