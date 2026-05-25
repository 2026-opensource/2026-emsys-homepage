import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import Mypage from "./pages/Mypage";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
