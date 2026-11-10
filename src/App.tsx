// =============================================================
// Điều hướng chính
//   /                    Welcome            (chỉ khi CHƯA đăng nhập)
//   /login               Login              (chỉ khi CHƯA đăng nhập)
//   /register            Registration       (chỉ khi CHƯA đăng nhập)
//   /register/complete   Registration Complete
//   /home                Home               (BẮT BUỘC đăng nhập)
//   /services            Service Selection  (BẮT BUỘC đăng nhập)
//   /journey             Journey Details    (BẮT BUỘC đăng nhập)
//   /profile             My Profile         (BẮT BUỘC đăng nhập)
//   /gallery             Xem các màn Figma tĩnh (không thuộc luồng chính)
// =============================================================
import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth } from "./components/RouteGuards";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegistrationCompletePage from "./pages/RegistrationCompletePage";
import HomePage from "./pages/HomePage";
import ServiceSelectionPage from "./pages/ServiceSelectionPage";
import JourneyDetailsPage from "./pages/JourneyDetailsPage";
import VehicleSizePage from "./pages/VehicleSizePage";
import AvailabilityPage from "./pages/AvailabilityPage";
import ProfilePage from "./pages/ProfilePage";
import { GalleryIndex, GalleryScreen } from "./pages/GalleryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestOnly><WelcomePage /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/register/complete" element={<RegistrationCompletePage />} />

      <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/services" element={<RequireAuth><ServiceSelectionPage /></RequireAuth>} />
      <Route path="/journey" element={<RequireAuth><JourneyDetailsPage /></RequireAuth>} />
      <Route path="/vehicle" element={<RequireAuth><VehicleSizePage /></RequireAuth>} />
      <Route path="/availability" element={<RequireAuth><AvailabilityPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

      <Route path="/gallery" element={<GalleryIndex />} />
      <Route path="/gallery/:slug" element={<GalleryScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
