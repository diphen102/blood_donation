import { useState } from "react";
import { Modal, Typography, Input, message } from "antd";
import { bloodUnitApi } from "../api/resourceApis";

export default function UseBloodUnitModal({ unit, onClose, onDone }) {
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleOk() {
    setSubmitting(true);
    try {
      await bloodUnitApi.use(unit._id, department);
      message.success("Đã đánh dấu sử dụng và thông báo cho CENTRAL.");
      setDepartment("");
      onDone();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={!!unit}
      title={`Đánh dấu đã sử dụng — ${unit?.code}`}
      onCancel={onClose}
      onOk={handleOk}
      okText="Xác nhận đã sử dụng"
      cancelText="Huỷ"
      confirmLoading={submitting}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        Xác nhận đơn vị máu này đã được sử dụng cho bệnh nhân. Hệ thống sẽ tự động báo cho người hiến máu và mọi tài khoản CENTRAL.
      </Typography.Paragraph>
      <Input placeholder="Khoa sử dụng (VD: Khoa Cấp cứu) - không bắt buộc" value={department} onChange={(e) => setDepartment(e.target.value)} />
    </Modal>
  );
}
