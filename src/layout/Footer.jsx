import React, { useEffect, useMemo, useState } from "react";
import { fetchExecutives } from "../api/introduceAPI";

const DEFAULT_CONTACT = {
  name: "-",
  phone_number: "-",
};

const formatPhoneNumber = (phoneNumber) => {
  const digits = phoneNumber?.replace(/\D/g, "");

  if (digits?.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  if (digits?.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  return phoneNumber || DEFAULT_CONTACT.phone_number;
};

const resolveContact = (executives, matcher) => {
  const member = executives.find(matcher);

  return {
    name: member?.name || DEFAULT_CONTACT.name,
    phone_number: formatPhoneNumber(member?.phone_number),
  };
};

function Footer() {
  const [executives, setExecutives] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadExecutives = async () => {
      try {
        const result = await fetchExecutives();

        if (isMounted) {
          setExecutives(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("푸터 임원 연락처 조회 실패:", error);

        if (isMounted) {
          setExecutives([]);
        }
      }
    };

    loadExecutives();

    return () => {
      isMounted = false;
    };
  }, []);

  const president = useMemo(
    () => resolveContact(executives, (member) => member.role === "PRESIDENT"),
    [executives],
  );

  const vicePresident = useMemo(
    () => resolveContact(
      executives,
      (member) => member.role === "OFFICER" && member.position?.includes("부회장"),
    ),
    [executives],
  );

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
              회장 {president.name} {president.phone_number}
              <br />
              부회장 {vicePresident.name} {vicePresident.phone_number}
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
