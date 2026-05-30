import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getUserRole } from "./utils/token";

import Home from "./pages/Home";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import Mypage from "./pages/Mypage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindAccount from "./pages/FindAccount";
import ChangePassword  from "./pages/ChangePassword";

import AdminPage from "./pages/Admin-page";
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

function App() {
  return (
    <BrowserRouter>
      <AdminFloatingButton />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-account" element={<FindAccount />} />
        <Route path="/change-password" element={<ChangePassword  />} />

        <Route path="/admin-page" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/post-detail" element={<PostDetail />} />
        <Route path="/post-write" element={<PostWrite />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
