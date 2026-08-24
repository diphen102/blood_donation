import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import DonorPage from "./pages/donor/DonorPage";
import DonationPage from "./pages/donation/DonationPage";
import HospitalPage from "./pages/hospital/HospitalPage";
import BloodUnitRoute from "./pages/bloodunit/BloodUnitRoute";
import BloodRequestPage from "./pages/bloodrequest/BloodRequestPage";
import NotificationPage from "./pages/notification/NotificationPage";
import BannerPage from "./pages/banner/BannerPage";
import UserPage from "./pages/admin/UserPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="donors" element={<PrivateRoute allowedRoles={["CENTRAL"]}><DonorPage /></PrivateRoute>} />
            <Route path="donations" element={<PrivateRoute allowedRoles={["CENTRAL"]}><DonationPage /></PrivateRoute>} />
            <Route path="hospitals" element={<PrivateRoute allowedRoles={["CENTRAL"]}><HospitalPage /></PrivateRoute>} />
            <Route path="blood-units" element={<PrivateRoute allowedRoles={["CENTRAL", "HOSPITAL"]}><BloodUnitRoute /></PrivateRoute>} />

            <Route path="blood-requests" element={<PrivateRoute allowedRoles={["CENTRAL", "HOSPITAL"]}><BloodRequestPage /></PrivateRoute>} />
            <Route path="notifications" element={<PrivateRoute allowedRoles={["CENTRAL"]}><NotificationPage /></PrivateRoute>} />
            <Route path="banners" element={<PrivateRoute allowedRoles={["CENTRAL"]}><BannerPage /></PrivateRoute>} />
            <Route path="admin/users" element={<PrivateRoute allowedRoles={["ADMIN"]}><UserPage /></PrivateRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
