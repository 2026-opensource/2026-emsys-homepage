import React from "react";

function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row">
          {/* 왼쪽 영역 */}
          <div className="col-sm-6">
            <h4 className="footer-logo">
              <i className="fa-regular fa-copyright"></i>
              EMSYS
            </h4>

            <p className="footer-description">
              충북 청주시 서원구 충대로 1(충북대학교)
              <br />
              전자정보대학 3관 S4-1
            </p>
          </div>

          {/* 오른쪽 영역 */}
          <div className="col-sm-6 text-right">
            <div className="footer-description-contact">
              회장 최봉규 010-0000-0000
              <br />
              부회장 탁우림 010-0000-0000
            </div>

            <div className="footer-socials">
              <a href="https://github.com/orgs/cbnuEMSYS">
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;