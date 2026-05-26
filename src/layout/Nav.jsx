import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoGreen from "../assets/images/logo-green-removebg.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Link to="/login">로그인</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
