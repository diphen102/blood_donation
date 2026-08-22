import CrudTable from "../../components/CrudTable";
import { hospitalApi } from "../../api/resourceApis";

const columns = [
  { title: "Tên bệnh viện", dataIndex: "name" },
  { title: "Địa chỉ", dataIndex: "address" },
  { title: "SĐT", dataIndex: "phone" },
];

const formFields = [
  { name: "name", label: "Tên bệnh viện", type: "text" },
  { name: "address", label: "Địa chỉ", type: "text" },
  { name: "phone", label: "Số điện thoại", type: "text" },
];

export default function HospitalPage() {
  return (
    <CrudTable
      title="Bệnh viện"
      api={hospitalApi}
      columns={columns}
      formFields={formFields}
      searchableFields={["name", "address"]}
    />
  );
}
