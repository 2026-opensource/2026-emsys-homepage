import { useEffect } from "react";
import { Clock3, Wrench } from "lucide-react";

import logoGreen from "../assets/images/logo-green-removebg.png";
import logoBlack from "../assets/images/logo-black-removebg.png";

import "../styles/service-maintenance.css";

// 점검 화면에 표시할 일시를 직접 입력하세요.
const MAINTENANCE_TIME = "2026년 8월 29일 00:00까지";

function ServiceMaintenance() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") ?? "dark";
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  return (
    <main className="service-maintenance-page">
      <section className="service-maintenance-card">
        <img
          className="service-maintenance-logo service-maintenance-logo-dark"
          src={logoGreen}
          alt="EMSYS"
        />
        <img
          className="service-maintenance-logo service-maintenance-logo-light"
          src={logoBlack}
          alt=""
          aria-hidden="true"
        />

        <p className="service-maintenance-label">SYSTEM MAINTENANCE</p>

        <div className="service-maintenance-title-row">
          <h1 className="service-maintenance-title">현재 서버 점검 중입니다</h1>
          <div className="service-maintenance-icon" aria-hidden="true">
            <Wrench size={27} strokeWidth={2.2} />
          </div>
        </div>

        <div className="service-maintenance-time" aria-label="점검 일시">
          <Clock3 size={24} aria-hidden="true" />
          <div>
            <span className="service-maintenance-time-label">점검 일시</span>
            <strong>{MAINTENANCE_TIME}</strong>
          </div>
        </div>

        <p className="service-maintenance-description">
          더 안정적인 서비스를 제공하기 위해 시스템을 점검하고 있습니다.
          <br />
          점검이 완료되는 대로 정상적으로 이용하실 수 있습니다.
        </p>

        <p className="service-maintenance-notice">
          이용에 불편을 드려 죄송합니다.
        </p>
      </section>
    </main>
  );
}

export default ServiceMaintenance;
