import { useAuth } from "../../context/AuthContext";
import BloodUnitPage from "./BloodUnitPage";
import HospitalBloodUnitPage from "./HospitalBloodUnitPage";

export default function BloodUnitRoute() {
  const { user } = useAuth();
  return user?.role === "HOSPITAL" ? <HospitalBloodUnitPage /> : <BloodUnitPage />;
}
