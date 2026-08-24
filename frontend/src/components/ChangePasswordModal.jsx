import { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { authApi } from "../api/authApi";

// Đổi mật khẩu tự phục vụ cho mọi role - khác với chức năng ADMIN reset mật khẩu tạm
// cho NGƯỜI KHÁC ở trang Quản lý tài khoản (UserPage.jsx).
export default function ChangePasswordModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await authApi.changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword });
      message.success("Đã đổi mật khẩu thành công.");
      form.resetFields();
      onClose();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    form.resetFields();
    onClose();
  }

  return (
    <Modal
      title="Đổi mật khẩu"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Đổi mật khẩu"
      cancelText="Huỷ"
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
}
