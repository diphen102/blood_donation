import { useState } from "react";
import { Modal, Typography, Input, message } from "antd";
import { bloodUnitApi } from "../api/resourceApis";

export default function DiscardBloodUnitModal({ unit, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleOk() {
    if (!reason.trim()) {
      message.error("Cần nhập lý do huỷ.");
      return;
    }
    setSubmitting(true);
    try {
      await bloodUnitApi.discard(unit._id, reason);
      message.success("Đã huỷ đơn vị máu và thông báo cho CENTRAL.");
      setReason("");
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
      title={`Huỷ đơn vị máu — ${unit?.code}`}
      onCancel={onClose}
      onOk={handleOk}
      okText="Xác nhận huỷ"
      okButtonProps={{ danger: true }}
      cancelText="Huỷ bỏ thao tác"
      confirmLoading={submitting}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        Dùng khi đơn vị máu gặp sự cố tại bệnh viện (hết hạn, hư hỏng khi vận chuyển/bảo quản...) và không thể sử dụng.
        Hệ thống sẽ tự động báo cho người hiến máu và mọi tài khoản CENTRAL.
      </Typography.Paragraph>
      <Input.TextArea
        rows={3}
        placeholder="Lý do huỷ (bắt buộc) - VD: hết hạn sử dụng, túi máu bị rách khi vận chuyển..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
}
