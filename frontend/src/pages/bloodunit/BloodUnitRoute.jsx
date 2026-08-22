import { useAuth } from "../../context/AuthContext";
import BloodUnitPage from "./BloodUnitPage";
import HospitalBloodUnitPage from "./HospitalBloodUnitPage";

// CENTRAL quản lý toàn quyền, HOSPITAL chỉ xem + đánh dấu đã sử dụng đơn vị máu tại viện mình.
export default function BloodUnitRoute() {
  const { user } = useAuth();
  return user?.role === "HOSPITAL" ? <HospitalBloodUnitPage /> : <BloodUnitPage />;
}
