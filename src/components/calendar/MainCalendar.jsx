import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import "./calendar.css";

function MainCalendar() {
  const [events, setEvents] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getTimeValue(value) {
    if (!value) return 0;
    return new Date(value).getTime();
  }

  function getDuration(event) {
    const start = getTimeValue(event.start);
    const end = event.end ? getTimeValue(event.end) : start;

    return end - start;
  }

  function formatDateTimeText(dateTime) {
    if (!dateTime) return "";

    const date = dateTime.slice(5, 10).replace("-", ".");
    const time = dateTime.slice(11, 16);

    return `${date} ${time}`;
  }

  function formatScheduleTimeText(event) {
    const startDate = event.start.slice(0, 10);
    const endDate = event.end ? event.end.slice(0, 10) : startDate;

    // 같은 날 일정이면 시간만 표시
    if (startDate === endDate) {
      return `${event.start.slice(11, 16)} ~ ${event.end.slice(11, 16)}`;
    }

    // 여러 날에 걸친 일정이면 날짜 + 시간 표시
    return `${formatDateTimeText(event.start)} ~ ${formatDateTimeText(event.end)}`;
  }

  function sortEventsByDurationThenStart(a, b) {
    const durationA = getDuration(a);
    const durationB = getDuration(b);

    // 1순위: 기간 긴 순
    if (durationA !== durationB) {
      return durationB - durationA;
    }

    const startA = getTimeValue(a.start);
    const startB = getTimeValue(b.start);

    // 2순위: 기간 같으면 시작 시간 빠른 순
    if (startA !== startB) {
      return startA - startB;
    }

    // 3순위: 제목순
    return a.title.localeCompare(b.title);
  }

  function getEventsByDate(dateStr) {
    return [...events]
      .filter((event) => event.start.slice(0, 10) === dateStr)
      .sort(sortEventsByDurationThenStart);
  }

  function openScheduleList(dateStr) {
    setSelectedDate(dateStr);
    setIsModalOpen(false);
    setIsListOpen(true);
  }

  function openAddModal(dateStr) {
    setEditingEventId(null);
    setScheduleTitle("");
    setStartTime(`${dateStr}T10:00`);
    setEndTime(`${dateStr}T18:00`);

    setIsListOpen(false);
    setIsModalOpen(true);
  }

  function openEditModal(eventData) {
    setEditingEventId(eventData.id);
    setScheduleTitle(eventData.title);

    setStartTime(eventData.start.slice(0, 16));

    if (eventData.end) {
      setEndTime(eventData.end.slice(0, 16));
    } else {
      setEndTime(eventData.start.slice(0, 16));
    }

    setIsListOpen(false);
    setIsModalOpen(true);
  }

  function handleDateClick(info) {
    openScheduleList(info.dateStr);
  }

  function handleEventClick(info) {
    const clickedDate = formatDate(info.event.start);
    openScheduleList(clickedDate);
  }

  function handleSaveSchedule(e) {
    e.preventDefault();

    if (new Date(startTime) > new Date(endTime)) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    if (editingEventId) {
      const updatedEvents = events.map((event) =>
        event.id === editingEventId
          ? {
            ...event,
            title: scheduleTitle,
            start: startTime,
            end: endTime,
          }
          : event
      );

      setEvents([...updatedEvents].sort(sortEventsByDurationThenStart));
    } else {
      const newSchedule = {
        id: String(Date.now()),
        title: scheduleTitle,
        start: startTime,
        end: endTime,
      };

      setEvents([...events, newSchedule].sort(sortEventsByDurationThenStart));
    }

    setIsModalOpen(false);
    setIsListOpen(false);
    setEditingEventId(null);
    setSelectedDate("");
  }

  function handleDeleteSchedule() {
    if (!editingEventId) return;

    const isDelete = window.confirm("이 일정을 삭제하시겠습니까?");
    if (!isDelete) return;

    setEvents(
      events
        .filter((event) => event.id !== editingEventId)
        .sort(sortEventsByDurationThenStart)
    );

    setIsModalOpen(false);
    setIsListOpen(false);
    setEditingEventId(null);
    setSelectedDate("");
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingEventId(null);
  }

  function handleCloseList() {
    setIsListOpen(false);
    setSelectedDate("");
  }

  return (
    <section className="calendar-section">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={[koLocale]}
        locale="ko"
        height="auto"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        displayEventTime={false}
        dayMaxEvents={2}
        moreLinkClick={(info) => {
          const clickedDate = formatDate(info.date);
          openScheduleList(clickedDate);

          return "none";
        }}
        // duration 큰 것부터, 시작 시간 빠른 것 부터, 제목순
        eventOrder="-duration,start,title"
        eventOrderStrict={true}
        headerToolbar={{
          left: "title",
          center: "",
          right: "prev,next today",
        }}
        buttonText={{
          today: "오늘",
        }}
      />

      {isListOpen && (
        <div className="schedule-list-overlay">
          <div className="schedule-list-modal">
            <div className="schedule-list-header">
              <h2 className="schedule-list-title">{selectedDate} 일정</h2>

              <button
                className="schedule-list-close-btn"
                type="button"
                onClick={handleCloseList}
              >
                ×
              </button>
            </div>

            <div className="schedule-list-body">
              {getEventsByDate(selectedDate).length > 0 ? (
                getEventsByDate(selectedDate).map((event) => (
                  <button
                    key={event.id}
                    className="schedule-list-item"
                    type="button"
                    onClick={() => openEditModal(event)}
                  >
                    <span className="schedule-list-item-title">
                      {event.title}
                    </span>

                    <span className="schedule-list-item-time">
                      {formatScheduleTimeText(event)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="schedule-list-empty">
                  등록된 일정이 없습니다.
                </p>
              )}
            </div>

            <button
              className="schedule-list-add-btn"
              type="button"
              onClick={() => openAddModal(selectedDate)}
            >
              일정 등록
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="schedule-modal-overlay">
          <div className="schedule-modal">
            <h2 className="schedule-modal-title">
              {editingEventId ? "일정 수정" : "일정 등록"}
            </h2>

            <form className="schedule-form" onSubmit={handleSaveSchedule}>
              <label className="schedule-label">일정 제목</label>
              <input
                className="schedule-input"
                type="text"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="일정 제목을 입력하세요"
                required
              />

              <label className="schedule-label">시작 시간</label>
              <input
                className="schedule-input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />

              <label className="schedule-label">종료 시간</label>
              <input
                className="schedule-input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />

              <div className="schedule-button-area">
                <button className="schedule-submit-btn" type="submit">
                  {editingEventId ? "수정" : "등록"}
                </button>

                {editingEventId && (
                  <button
                    className="schedule-delete-btn"
                    type="button"
                    onClick={handleDeleteSchedule}
                  >
                    삭제
                  </button>
                )}

                <button
                  className="schedule-cancel-btn"
                  type="button"
                  onClick={handleCloseModal}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MainCalendar;