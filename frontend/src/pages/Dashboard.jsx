import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Statistic, Typography, Spin, List, Tag, Empty, Modal, Button } from "antd";
import {
  TeamOutlined, HeartOutlined, MedicineBoxOutlined, BankOutlined, BellOutlined,
  CalendarOutlined, CheckOutlined, ExperimentOutlined,
} from "@ant-design/icons";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { donorApi, donationApi, hospitalApi, bloodUnitApi, bloodRequestApi, notificationApi } from "../api/resourceApis";
import { STATUS_STEPS } from "../constants/bloodUnitStatus";
import { computeNextEligibleDate, DONATION_TYPE_LABELS } from "../constants/donationType";
import { summarizeFromAggregation } from "../utils/hospitalInventory";

const CHART_COLORS = ["#8E2430", "#39597A", "#2F7D4F", "#B4790A", "#5B4B8A", "#3C7A78", "#8A3F5B", "#5B6270"];

function groupCount(list, field) {
  const map = {};
  list.forEach((item) => {
    const key = item[field] || "Không rõ";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

// Cộng dồn 1 field (available/total) qua toàn bộ map lồng { bloodGroup: { donationType: {...} } }
function sumNested(inventoryByGroup, field) {
  return Object.values(inventoryByGroup || {}).reduce(
    (sum, byType) => sum + Object.values(byType).reduce((s, v) => s + v[field], 0),
    0
  );
}

function CentralDashboard() {
  const [counts, setCounts] = useState(null);
  const [unitsByStatus, setUnitsByStatus] = useState([]);
  const [donorsByBloodGroup, setDonorsByBloodGroup] = useState([]);

  useEffect(() => {
    Promise.all([
      donorApi.list(),
      donationApi.list(),
      hospitalApi.list(),
      bloodUnitApi.summary(),
      bloodRequestApi.list({ status: "PENDING" }),
    ]).then(([donors, donations, hospitals, unitSummary, pending]) => {
      // unitSummary.data: { bloodGroup: { donationType: { status: count } } } -
      // gộp cả loại chế phẩm lại để ra tổng quan theo trạng thái (biểu đồ tổng quan không cần
      // tách nhỏ theo loại, chỉ trang "Đơn vị máu" chi tiết mới cần tách).
      const statusTotals = {};
      let bloodUnitsTotal = 0;
      Object.values(unitSummary.data).forEach((byType) => {
        Object.values(byType).forEach((byStatus) => {
          Object.entries(byStatus).forEach(([status, count]) => {
            statusTotals[status] = (statusTotals[status] || 0) + count;
            bloodUnitsTotal += count;
          });
        });
      });

      setCounts({
        donors: donors.data.length,
        donations: donations.data.length,
        hospitals: hospitals.data.length,
        bloodUnits: bloodUnitsTotal,
        pendingRequests: pending.data.length,
      });
      setUnitsByStatus(Object.entries(statusTotals).map(([name, value]) => ({ name, value })));
      setDonorsByBloodGroup(groupCount(donors.data, "bloodGroup"));
    });
  }, []);

  if (!counts) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;

  return (
    <>
      <Typography.Title level={3} className="app-heading">Tổng quan hệ thống (BVTW Huế)</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Người hiến máu" value={counts.donors} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Lượt hiến máu" value={counts.donations} prefix={<HeartOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Bệnh viện" value={counts.hospitals} prefix={<BankOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Đơn vị máu" value={counts.bloodUnits} prefix={<MedicineBoxOutlined />} /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Yêu cầu đang chờ duyệt"
              value={counts.pendingRequests}
              valueStyle={{ color: counts.pendingRequests > 0 ? "#8E2430" : undefined }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Đơn vị máu theo trạng thái">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={unitsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8E2430" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Người hiến theo nhóm máu">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={donorsByBloodGroup} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {donorsByBloodGroup.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}

function HospitalDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(null);
  const [inventoryByGroup, setInventoryByGroup] = useState(null);

  useEffect(() => {
    bloodRequestApi.list().then((res) => setRequests(res.data));
    bloodUnitApi.summary().then((res) => setInventoryByGroup(summarizeFromAggregation(res.data)));
  }, []);

  if (!requests || !inventoryByGroup) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const receivedAwaitingUse = sumNested(inventoryByGroup, "available");
  const totalAtHospital = sumNested(inventoryByGroup, "total");
  const byStatus = groupCount(requests, "status");

  return (
    <>
      <Typography.Title level={3} className="app-heading">Tổng quan bệnh viện</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}><Card><Statistic title="Tổng yêu cầu đã gửi" value={requests.length} /></Card></Col>
        <Col xs={24} sm={12} md={8}><Card><Statistic title="Đang chờ duyệt" value={pending} /></Card></Col>
        <Col xs={24} sm={12} md={8}><Card><Statistic title="Đã duyệt (chờ nhận)" value={approved} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={<span><ExperimentOutlined /> Còn lại có thể sử dụng tại bệnh viện</span>}
            extra={<Button type="link" onClick={() => navigate("/blood-units")}>Xem chi tiết & xử lý →</Button>}
          >
            {totalAtHospital === 0 ? (
              <Empty description="Chưa có đơn vị máu nào tại bệnh viện của bạn." />
            ) : receivedAwaitingUse === 0 ? (
              <Typography.Text type="secondary">Hiện không còn đơn vị máu nào sẵn sàng sử dụng (đã dùng hết hoặc đang chờ điều phối).</Typography.Text>
            ) : (
              <Row gutter={12}>
                {Object.entries(inventoryByGroup).flatMap(([group, byType]) =>
                  Object.entries(byType)
                    .filter(([, { available }]) => available > 0)
                    .map(([type, { available }]) => (
                      <Col key={`${group}-${type}`}>
                        <Tag color="#8E2430" style={{ fontSize: 14, padding: "4px 12px" }}>
                          {group} · {DONATION_TYPE_LABELS[type] || type}: {available}
                        </Tag>
                      </Col>
                    ))
                )}
              </Row>
            )}
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
              Tổng cộng {totalAtHospital} đơn vị từng qua bệnh viện (kể cả đã sử dụng/huỷ) — xem chi tiết ở trang Đơn vị máu.
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Yêu cầu theo trạng thái">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#39597A" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}

function findHistoryDate(history, status) {
  const entry = (history || []).find((h) => h.status === status);
  return entry ? new Date(entry.date).toLocaleDateString("vi-VN") : null;
}

function DonationDetailModal({ donation, onClose }) {
  const [units, setUnits] = useState(null);

  useEffect(() => {
    if (!donation) return;
    setUnits(null);
    bloodUnitApi.forDonation(donation._id).then((res) => setUnits(res.data));
  }, [donation]);

  if (!donation) return null;

  const unit = units && units.length > 0 ? units[0] : null;
  const isDiscarded = unit?.status === "DISCARDED";
  const testedIndex = STATUS_STEPS.findIndex((s) => s.value === "TESTED");
  const currentIndex = unit ? STATUS_STEPS.findIndex((s) => s.value === unit.status) : -1;

  return (
    <Modal open={!!donation} onCancel={onClose} footer={null} title="Chi tiết lần hiến máu">
      <ul className="journey-timeline">
        <li className="journey-step journey-step--done">
          <span className="journey-step__dot"><CheckOutlined /></span>
          <div className="journey-step__label">Hiến máu tại {donation.location}</div>
          <div className="journey-step__date">{new Date(donation.donationDate).toLocaleDateString("vi-VN")}</div>
        </li>

        {units === null ? (
          <li className="journey-step"><Spin size="small" /></li>
        ) : !unit ? (
          <li className="journey-step">
            <span className="journey-step__dot"><MedicineBoxOutlined /></span>
            <div className="journey-step__label" style={{ color: "#6B7280", fontWeight: 500 }}>
              Đơn vị máu từ lần hiến này chưa được BVTW Huế ghi nhận vào kho.
            </div>
          </li>
        ) : (
          STATUS_STEPS.slice(1).map((step, i) => {
            const stepIndex = i + 1;
            if (isDiscarded && stepIndex > testedIndex) return null;
            const done = isDiscarded ? stepIndex <= testedIndex : stepIndex <= currentIndex;
            const isDestinationStep = step.value === "DISPATCHED" || step.value === "RECEIVED" || step.value === "USED";
            const date = findHistoryDate(unit.statusHistory, step.value);
            return (
              <li key={step.value} className={`journey-step ${done ? "journey-step--done" : ""}`}>
                <span className="journey-step__dot">{done ? <CheckOutlined /> : stepIndex + 1}</span>
                <div className="journey-step__label">
                  {step.label}
                  {done && isDestinationStep && unit.currentHospital?.name && (
                    <span style={{ fontWeight: 400, color: "#6B7280" }}> — {unit.currentHospital.name}</span>
                  )}
                  {done && step.value === "USED" && unit.department && (
                    <span style={{ fontWeight: 400, color: "#6B7280" }}> ({unit.department})</span>
                  )}
                </div>
                {date && <div className="journey-step__date">{date}</div>}
              </li>
            );
          })
        )}

        {isDiscarded && (
          <li className="journey-step journey-step--done">
            <span className="journey-step__dot" style={{ background: "#8E2430" }}>!</span>
            <div className="journey-step__label" style={{ color: "#8E2430" }}>
              Đơn vị máu này không đạt yêu cầu xét nghiệm và đã được huỷ, không được sử dụng.
            </div>
            {unit.testRecommendation && <div className="journey-step__date">Khuyến nghị: {unit.testRecommendation}</div>}
          </li>
        )}
      </ul>
      {unit && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Mã đơn vị máu: <b>{unit.code}</b> · Trạng thái hiện tại: <b>{unit.status}</b>
        </Typography.Text>
      )}
    </Modal>
  );
}

function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    donorApi.me().then((res) => setProfile(res.data));
    donationApi.mine().then((res) => setDonations(res.data));
    notificationApi.mine().then((res) => setNotifications(res.data));
  }, []);

  return (
    <>
      <Typography.Title level={3} className="app-heading">Trang của tôi</Typography.Title>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Số lần đã hiến máu" value={donations?.length ?? 0} prefix={<HeartOutlined />} loading={donations === null} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nhóm máu"
              value={profile?.bloodGroup || "—"}
              prefix={<ExperimentOutlined />}
              loading={profile === null}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Lần hiến gần nhất"
              value={donations && donations.length > 0 ? new Date(donations[0].donationDate).toLocaleDateString("vi-VN") : "—"}
              prefix={<CalendarOutlined />}
              loading={donations === null}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có thể hiến lại từ"
              value={
                donations && donations.length > 0
                  ? computeNextEligibleDate(donations[0].donationDate, donations[0].donationType).toLocaleDateString("vi-VN")
                  : "—"
              }
              prefix={<CalendarOutlined />}
              loading={donations === null}
              valueStyle={donations && donations.length > 0 && computeNextEligibleDate(donations[0].donationDate, donations[0].donationType) <= new Date() ? { color: "#1F9254" } : undefined}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title={<span><HeartOutlined /> Lịch sử hiến máu của bạn</span>} bodyStyle={{ background: "transparent" }}>
            {donations === null ? (
              <Spin />
            ) : donations.length === 0 ? (
              <Empty description="Chưa liên kết hồ sơ hiến máu hoặc chưa có lượt hiến nào." />
            ) : (
              donations.map((d) => (
                <div key={d._id} className="history-card">
                  <div className="history-card__icon"><HeartOutlined /></div>
                  <div className="history-card__body">
                    <div className="history-card__title">{d.location}</div>
                    <div className="history-card__meta">
                      <CalendarOutlined /> {new Date(d.donationDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <Button size="small" type="link" onClick={() => setSelected(d)}>Xem chi tiết</Button>
                </div>
              ))
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<span><BellOutlined /> Thông báo</span>}>
            {notifications === null ? (
              <Spin />
            ) : notifications.length === 0 ? (
              <Empty description="Chưa có thông báo nào." />
            ) : (
              <List
                dataSource={notifications}
                renderItem={(n) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<span>{n.title} {!n.isRead && n.receiverId && <Tag color="red">Mới</Tag>}</span>}
                      description={n.content}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <DonationDetailModal donation={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function AdminDashboard() {
  return (
    <Card>
      <Typography.Title level={4}>Trang quản trị</Typography.Title>
      <Typography.Paragraph type="secondary">
        Dùng menu bên trái để quản lý tài khoản người dùng.
      </Typography.Paragraph>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "CENTRAL") return <CentralDashboard />;
  if (user?.role === "HOSPITAL") return <HospitalDashboard />;
  if (user?.role === "DONOR") return <DonorDashboard />;
  if (user?.role === "ADMIN") return <AdminDashboard />;
  return null;
}
