import React from "react";
import { Link } from "react-router-dom";
import logoGreen from "../assets/images/logo-green-removebg.png";

function Navbar() {
  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#myNavbar"
          >
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>

          <Link className="navbar-brand" to="/">
            <img
              src={logoGreen}
              alt="EMSYS 로고"
              className="navbar-logo"
            />
          </Link>
        </div>

        <div className="collapse navbar-collapse" id="myNavbar">
          <ul className="nav navbar-nav">
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
      </div>
    </nav>
  );
}

export default Navbar;