import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import "./calendar.css";
import { getToken, getUserRole } from "../../utils/token";

const ALLOWED_ROLES = ["OFFICER", "PRESIDENT"];
const API_BASE = "/api/event";

function getAuthToken() {
  return getToken();
}

function MainCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 권한 확인
  const userRole = getUserRole();
  const canEdit = ALLOWED_ROLES.includes(userRole);

  // 서버에서 일정 목록 로드
  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const json = await res.json();

      if (json.success) {
        // FullCalendar용으로 start_time → start, end_time → end 변환
        const converted = json.data.map((e) => ({
          id: String(e.id),
          title: e.title,
          start: e.start_time ? e.start_time.slice(0, 16) : null,
          end: e.end_time ? e.end_time.slice(0, 16) : null,
        }));
        setEvents(converted);
      } else {
        console.error("일정 조회 실패:", json.message);
      }
    } catch (error) {
      console.error("일정 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  }

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

    if (startDate === endDate) {
      return `${event.start.slice(11, 16)} ~ ${event.end.slice(11, 16)}`;
    }

    return `${formatDateTimeText(event.start)} ~ ${formatDateTimeText(event.end)}`;
  }

  function sortEventsByDurationThenStart(a, b) {
    const durationA = getDuration(a);
    const durationB = getDuration(b);

    if (durationA !== durationB) {
      return durationB - durationA;
    }

    const startA = getTimeValue(a.start);
    const startB = getTimeValue(b.start);

    if (startA !== startB) {
      return startA - startB;
    }

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

  async function handleSaveSchedule(e) {
    e.preventDefault();

    if (new Date(startTime) > new Date(endTime)) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    // 기존 event.controller가 start_time, end_time 필드명 사용
    const body = JSON.stringify({
      title: scheduleTitle,
      start_time: startTime,
      end_time: endTime,
    });

    try {
      let res;

      if (editingEventId) {
        res = await fetch(`${API_BASE}/${editingEventId}`, { method: "PUT", headers, body });
      } else {
        res = await fetch(API_BASE, { method: "POST", headers, body });
      }

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "저장에 실패했습니다.");
        return;
      }

      await fetchSchedules();
    } catch (error) {
      console.error("일정 저장 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }

    setIsModalOpen(false);
    setIsListOpen(false);
    setEditingEventId(null);
    setSelectedDate("");
  }

  async function handleDeleteSchedule() {
    if (!editingEventId) return;

    const isDelete = window.confirm("이 일정을 삭제하시겠습니까?");
    if (!isDelete) return;

    const token = getAuthToken();

    try {
      const res = await fetch(`${API_BASE}/${editingEventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "삭제에 실패했습니다.");
        return;
      }

      await fetchSchedules();
    } catch (error) {
      console.error("일정 삭제 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }

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
      {loading && (
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "12px" }}>
          불러오는 중...
        </p>
      )}

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
                    onClick={() => canEdit && openEditModal(event)}
                    style={{ cursor: canEdit ? "pointer" : "default" }}
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

            {/* 임원진만 등록 버튼 표시 */}
            {canEdit && (
              <button
                className="schedule-list-add-btn"
                type="button"
                onClick={() => openAddModal(selectedDate)}
              >
                일정 등록
              </button>
            )}
          </div>
        </div>
      )}

      {/* 임원진만 등록/수정 모달 열 수 있음 */}
      {isModalOpen && canEdit && (
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
