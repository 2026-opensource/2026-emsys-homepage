import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getUserRole } from "./utils/token";

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

const AdminRoute = ({ children }) => {
  const role = getUserRole();
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
        <Route path="/resources" element={<Resources />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-account" element={<FindAccount />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route path="/community/write" element={<PostWrite />} />
        <Route path="/resources/write" element={<PostWrite />} />
        <Route path="/gallery/write" element={<PostWrite />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/edit" element={<PostWrite />} />

        <Route path="/admin-page" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/post-detail" element={<PostDetail />} />
        <Route path="/post-write" element={<PostWrite />} />
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