import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoGreen from "../assets/images/logo-green-removebg.png";

import { isLoggedIn, removeToken } from "../utils/token";

function Navbar() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    removeToken();
    setLoggedIn(false);
    setMenuOpen(false);
    alert("로그아웃되었습니다.");
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 로고 */}
        <Link className="navbar-brand" to="/">
          <img src={logoGreen} alt="EMSYS 로고" className="navbar-logo" />
        </Link>

        {/* 햄버거 버튼 */}
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {/* 메뉴 */}
        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <li>
            <Link to="/community">커뮤니티</Link>
          </li>

          <li>
            <Link to="/resources">자료실</Link>
          </li>

          <li>
            <Link to="/mypage">마이페이지</Link>
          </li>

          <li>
            {loggedIn ? (
              <Link
                to="/"
                onClick={() => {
                  removeToken();
                  setLoggedIn(false);
                  setMenuOpen(false);
                  alert("로그아웃되었습니다.");
                }}
              >
                로그아웃
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                로그인
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
