import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";

import logoGreen from "../assets/images/logo-green-removebg.png";
import logoBlack from "../assets/images/logo-black-removebg.png";
import { getLatestMaintenancePost } from "../api/postAPI";
import { formatMaintenancePeriod } from "../utils/maintenanceFormat";

import "../styles/service-maintenance.css";

function ServiceMaintenance({ maintenance = null }) {
  const [latestMaintenance, setLatestMaintenance] = useState(maintenance);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") ?? "dark";
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  useEffect(() => {
    if (maintenance) {
      setLatestMaintenance(maintenance);
      return;
    }

    let isActive = true;

    async function fetchLatestMaintenance() {
      try {
        const result = await getLatestMaintenancePost();
        if (isActive) {
          setLatestMaintenance(result.data || null);
        }
      } catch (error) {
        console.error("최신 점검 안내 조회 실패:", error);
      }
    }

    fetchLatestMaintenance();

    return () => {
      isActive = false;
    };
  }, [maintenance]);

  const maintenanceTime = formatMaintenancePeriod(latestMaintenance);
  const maintenanceMessage = latestMaintenance?.maintenance_message?.trim() || "";

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
          <div>
            <span className="service-maintenance-time-label">점검 일시</span>
            <strong>{maintenanceTime}</strong>
          </div>
        </div>

        <div className="service-maintenance-message" aria-label="점검 내용">
          <span className="service-maintenance-time-label">점검 내용</span>
          <strong>{maintenanceMessage}</strong>
        </div>

        <p className="service-maintenance-description">
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
