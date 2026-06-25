import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getUserRole, isLoggedIn, redirectToLogin } from "./utils/token";

import Introduce from "./pages/Introduce";
import Home from "./pages/Home";
import Community from "./pages/Community";
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

import AdminFloatingButton from "./components/admin/adminFloatingButton";

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

function AppContent() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/introduce" && <AdminFloatingButton />}
      <Routes>
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/resources" element={<AuthRoute><Resources /></AuthRoute>} />
        <Route path="/mypage" element={<AuthRoute><Mypage /></AuthRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-account" element={<FindAccount />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route path="/community/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/resources/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/gallery/write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/posts/:id" element={<AuthRoute><PostDetail /></AuthRoute>} />
        <Route path="/posts/:id/edit" element={<AuthRoute><PostWrite /></AuthRoute>} />

        <Route path="/admin-page" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/post-detail" element={<AuthRoute><PostDetail /></AuthRoute>} />
        <Route path="/post-write" element={<AuthRoute><PostWrite /></AuthRoute>} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
