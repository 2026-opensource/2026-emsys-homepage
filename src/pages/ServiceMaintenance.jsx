import { useEffect } from "react";
import { RefreshCw, Wrench } from "lucide-react";

import logoGreen from "../assets/images/logo-green-removebg.png";

import "../styles/service-maintenance.css";

function ServiceMaintenance() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") ?? "dark";
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <main className="service-maintenance-page">
      <section className="service-maintenance-card">
        <img
          className="service-maintenance-logo"
          src={logoGreen}
          alt="EMSYS"
        />

        <div className="service-maintenance-icon" aria-hidden="true">
          <Wrench size={34} strokeWidth={2} />
        </div>

        <p className="service-maintenance-label">SYSTEM MAINTENANCE</p>
        <h1 className="service-maintenance-title">현재 서버 점검 중입니다</h1>

        <p className="service-maintenance-description">
          더 안정적인 서비스를 제공하기 위해 시스템을 점검하고 있습니다.
          <br />
          점검이 완료되는 대로 정상적으로 이용하실 수 있습니다.
        </p>

        <div className="service-maintenance-status" role="status">
          <span className="service-maintenance-status-dot" aria-hidden="true" />
          서버 상태를 확인하고 있습니다
        </div>

        <button
          type="button"
          className="service-maintenance-refresh-btn"
          onClick={handleRefresh}
        >
          <RefreshCw size={18} aria-hidden="true" />
          새로고침
        </button>

        <p className="service-maintenance-notice">
          이용에 불편을 드려 죄송합니다.
        </p>
      </section>
    </main>
  );
}

export default ServiceMaintenance;
