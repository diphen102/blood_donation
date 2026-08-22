import CrudTable from "../../components/CrudTable";
import { donorApi } from "../../api/resourceApis";

const columns = [
  { title: "Họ tên", dataIndex: "fullName" },
  { title: "CCCD", dataIndex: "cccd" },
  { title: "SĐT", dataIndex: "phone" },
  { title: "Nhóm máu", dataIndex: "bloodGroup" },
  { title: "Ngày sinh", dataIndex: "birthDate", render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "") },
];

const formFields = [
  { name: "fullName", label: "Họ tên", type: "text" },
  { name: "cccd", label: "CCCD", type: "text" },
  { name: "phone", label: "Số điện thoại", type: "text" },
  {
    name: "bloodGroup",
    label: "Nhóm máu",
    type: "select",
    options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v })),
  },
  { name: "birthDate", label: "Ngày sinh", type: "date" },
];

export default function DonorPage() {
  return (
    <CrudTable
      title="Người hiến máu"
      api={donorApi}
      columns={columns}
      formFields={formFields}
      searchableFields={["fullName", "cccd", "phone"]}
    />
  );
}
