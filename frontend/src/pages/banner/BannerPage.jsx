import CrudTable from "../../components/CrudTable";
import { bannerApi } from "../../api/resourceApis";

const columns = [
  { title: "Tiêu đề", dataIndex: "title" },
  { title: "Ảnh (URL)", dataIndex: "image", ellipsis: true },
  { title: "Bắt đầu", dataIndex: "startDate", render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "") },
  { title: "Kết thúc", dataIndex: "endDate", render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "") },
];

const formFields = [
  { name: "title", label: "Tiêu đề", type: "text" },
  { name: "image", label: "URL ảnh", type: "text" },
  { name: "startDate", label: "Ngày bắt đầu", type: "date" },
  { name: "endDate", label: "Ngày kết thúc", type: "date" },
];

export default function BannerPage() {
  return <CrudTable title="Banner & Tin tức" api={bannerApi} columns={columns} formFields={formFields} />;
}
