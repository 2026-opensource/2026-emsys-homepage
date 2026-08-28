import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getUserRole, isLoggedIn, redirectToLogin } from "./utils/token";

import Introduce from "./pages/Introduce";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Popular from "./pages/Popular";
import Notice from "./pages/Notice";
import Resources from "./pages/Resources";
import Mypage from "./pages/Mypage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindAccount from "./pages/FindAccount";
import ChangePassword from "./pages/ChangePassword";

import AdminPage from "./pages/AdminPage";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";
import Gallery from "./pages/Gallery";
import Maintenance from "./pages/Maintenance";
import ServiceMaintenance from "./pages/ServiceMaintenance";

import AdminFloatingButton from "./components/admin/adminFloatingButton";
import MemberInfo from "./pages/MemberInfo";
import { shouldHideIntroduceLanding } from "./utils/landingPreference";
const AuthRoute = ({ children }) => {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!loggedIn) {
      redirectToLogin(navigate);
    }
  }, [loggedIn, navigate]);

  if (!loggedIn) {
    return null;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const role = loggedIn ? getUserRole() : null;

  useEffect(() => {
    if (!loggedIn) {
      redirectToLogin(navigate);
    }
  }, [loggedIn, navigate]);

  if (!loggedIn) {
    return null;
  }

  if (role !== 'OFFICER' && role !== 'PRESIDENT') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RootRoute = () => {
  const location = useLocation();

  if (location.state?.showHome) {
    return <Home />;
  }

  return shouldHideIntroduceLanding() ? <Home /> : <Introduce />;
};

function AppContent() {
  const location = useLocation();
  const showHomeFromLanding = Boolean(location.state?.showHome);
  const isLandingVisible =
    location.pathname === "/introduce" ||
    (location.pathname === "/" && !showHomeFromLanding && !shouldHideIntroduceLanding());
  const isServiceMaintenancePage = location.pathname === "/service-maintenance";

  return (
    <>
      {!isLandingVisible && !isServiceMaintenancePage && <AdminFloatingButton />}
      <Routes>
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/service-maintenance" element={<ServiceMaintenance />} />
        <Route path="/" element={<RootRoute />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/community" element={<Community />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/resources" element={<AuthRoute><Resources /></AuthRoute>} />
        <Route path="/mypage" element={<AuthRoute><Mypage /></AuthRoute>} />
        <Route path="/mypage/:userId" element={<AuthRoute><Mypage /></AuthRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-account" element={<FindAccount />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route path="/notice/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/community/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/resources/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/gallery/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/maintenance/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/edit" element={<AuthRoute><PostWrite /></AuthRoute>} />

        <Route path="/admin-page" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin-page/memberInfo" element={<AdminRoute><MemberInfo /></AdminRoute>} />
        <Route path="/post-detail" element={<PostDetail />} />
        <Route path="/post-write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
    </>
  );
}

function App() {
  const isMaintenanceMode =
    import.meta.env.VITE_MAINTENANCE_MODE === "true";

  if (isMaintenanceMode) {
    return <ServiceMaintenance />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
