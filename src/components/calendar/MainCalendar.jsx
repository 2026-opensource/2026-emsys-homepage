import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./calendar.css";

function MainCalendar() {
  const events = [
    {
      title: "개강총회",
      date: "2026-03-05",
    },
    {
      title: "스터디 모집",
      date: "2026-03-12",
    },
    {
      title: "MT",
      date: "2026-03-20",
    },
  ];

  return (
    <section className="calendar-section">
      <div className="container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={events}
          height="auto"
        />
      </div>
    </section>
  );
}

export default MainCalendar;