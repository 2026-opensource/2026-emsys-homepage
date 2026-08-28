import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import logoGreen from "../assets/images/logo-green-removebg.png";
import logoBlack from "../assets/images/logo-black-removebg.png";

import { isLoggedIn, removeToken, removeUserInfo } from "../utils/token";

function Navbar() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    removeToken();
    removeUserInfo();
    setLoggedIn(false);
    setMenuOpen(false);
    alert("로그아웃되었습니다.");
    navigate("/");
  }

  function ThemeToggle() {
    const transitionTimer = useRef(null);
    const [theme, setTheme] = useState(
      () => localStorage.getItem("theme") ?? "dark",
    );

    useEffect(() => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
      return () => {
        clearTimeout(transitionTimer.current);
        document.documentElement.classList.remove("theme-transitioning");
      };
    }, []);

    function handleThemeToggle() {
      const nextTheme = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      clearTimeout(transitionTimer.current);
      root.classList.remove("theme-transitioning");
      root.dataset.theme = nextTheme;
      void root.offsetWidth;
      root.classList.add("theme-transitioning");

      setTheme(nextTheme);
      transitionTimer.current = setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 500);
    }

    return (
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={handleThemeToggle}
        aria-label="테마 전환"
      >
        {theme === "dark" ? (
          <Sun aria-hidden="true" />
        ) : (
          <Moon aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 로고 */}
        <Link className="navbar-brand" to="/">
          <img
            src={logoGreen}
            alt="EMSYS 로고"
            className="navbar-logo navbar-logo-dark"
          />
          <img
            src={logoBlack}
            alt=""
            aria-hidden="true"
            className="navbar-logo navbar-logo-light"
          />
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
                  removeUserInfo();
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
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
