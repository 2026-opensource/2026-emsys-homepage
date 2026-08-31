import { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import "./calendar.css";
import { getToken, getUserRole } from "../../utils/token";

const ALLOWED_ROLES = ["OFFICER", "PRESIDENT"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/event`;
const DEFAULT_EVENT_COLOR = "#5cffc7";
const EVENT_COLOR_OPTIONS = [
  { value: "#5cffc7", legacyValue: "#00ffa3", label: "민트", textColor: "black" },
  { value: "#6eea85", legacyValue: "#22c55e", label: "그린", textColor: "black" },
  { value: "#67dfff", legacyValue: "#38bdf8", label: "스카이", textColor: "black" },
  { value: "#82b7ff", legacyValue: "#3b82f6", label: "블루", textColor: "black" },
  { value: "#b498ff", legacyValue: "#8b5cf6", label: "퍼플", textColor: "black" },
  { value: "#ff8ac8", legacyValue: "#ec4899", label: "핑크", textColor: "black" },
  { value: "#ffae5c", legacyValue: "#f97316", label: "오렌지", textColor: "black" },
  { value: "#ffdf4d", legacyValue: "#facc15", label: "옐로우", textColor: "black" },
  { value: "#ff8a8a", legacyValue: "#ef4444", label: "레드", textColor: "black" },
  { value: "#cbd5e1", legacyValue: "#94a3b8", label: "그레이", textColor: "black" },
];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0")
);

function getAuthToken() {
  return getToken();
}

function getEventColorOption(color) {
  return EVENT_COLOR_OPTIONS.find((option) =>
    option.value === color || option.legacyValue === color
  ) || EVENT_COLOR_OPTIONS[0];
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  const [isAllDay, setIsAllDay] = useState(false);
  const [scheduleColor, setScheduleColor] = useState(DEFAULT_EVENT_COLOR);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(null);
  const selectedTimeOptionRef = useRef(null);

  // 권한 확인
  const userRole = getUserRole();
  const canEdit = ALLOWED_ROLES.includes(userRole);

  useEffect(() => {
    if (!isListOpen && !isModalOpen) return;

    function handleEscapeKey(e) {
      if (e.key !== "Escape") return;

      setIsListOpen(false);
      setIsModalOpen(false);
      setEditingEventId(null);
      setSelectedDate("");
      setIsColorPaletteOpen(false);
      setOpenTimePicker(null);
    }

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isListOpen, isModalOpen]);

  useEffect(() => {
    if (!openTimePicker || !selectedTimeOptionRef.current) return;

    window.requestAnimationFrame(() => {
      selectedTimeOptionRef.current?.scrollIntoView({
        block: "center",
      });
    });
  }, [openTimePicker, startTime, endTime]);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const json = await res.json();

      if (json.success) {
        // FullCalendar용으로 start_time → start, end_time → end 변환
        const converted = json.data.map((e) => {
          const toKST = (utcStr) => {
            if (!utcStr) return null;
            const date = new Date(utcStr);
            date.setHours(date.getHours() + 9);
            return date.toISOString().slice(0, 16);
          };
          const getNextDate = (dateStr) => {
            const date = new Date(`${dateStr}T00:00:00`);
            date.setDate(date.getDate() + 1);
            return formatDate(date);
          };
          const start = toKST(e.start_time);
          const end = toKST(e.end_time);
          const isAllDayEvent = Boolean(e.is_all_day);
          const displayStartDate = start?.slice(0, 10);
          const displayEndDate = end?.slice(0, 10) || displayStartDate;
          const colorOption = getEventColorOption(e.color);
          const eventColor = colorOption.value;

          return {
            id: String(e.id),
            title: e.title,
            start: isAllDayEvent ? displayStartDate : start,
            end: isAllDayEvent && displayEndDate ? getNextDate(displayEndDate) : end,
            allDay: isAllDayEvent,
            backgroundColor: eventColor,
            borderColor: eventColor,
            textColor: "black",
            color: eventColor,
            display: "block",
            displayStartDate,
            displayEndDate,
            isAllDay: isAllDayEvent,
          };
        });
        setEvents(converted);
      } else {
        console.error("일정 조회 실패:", json.message);
      }
    } catch (error) {
      console.error("일정 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 서버에서 일정 목록 로드
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchSchedules();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchSchedules]);

  function formatDateLabel(dateStr) {
    return dateStr.replaceAll("-", ".");
  }

  function formatDateRangeLabel(startDate, endDate) {
    if (!startDate || !endDate || startDate === endDate) {
      return formatDateLabel(startDate || "");
    }

    const [startYear, startMonth, startDay] = startDate.split("-");
    const [endYear, endMonth, endDay] = endDate.split("-");

    if (startYear === endYear && startMonth === endMonth) {
      return `${startYear}.${startMonth}.${startDay} ~ ${endDay}`;
    }

    if (startYear === endYear) {
      return `${startYear}.${startMonth}.${startDay} ~ ${endMonth}.${endDay}`;
    }

    return `${formatDateLabel(startDate)} ~ ${formatDateLabel(endDate)}`;
  }

  function getEventStartDate(event) {
    return event.displayStartDate || event.start?.slice(0, 10);
  }

  function getEventEndDate(event) {
    return event.displayEndDate || event.end?.slice(0, 10) || getEventStartDate(event);
  }

  function isEventOnDate(event, dateStr) {
    const startDate = getEventStartDate(event);
    const endDate = getEventEndDate(event);

    if (!startDate || !endDate || !dateStr) {
      return false;
    }

    return startDate <= dateStr && dateStr <= endDate;
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
    const startDate = getEventStartDate(event);
    const endDate = getEventEndDate(event);

    if (event.isAllDay) {
      return formatDateRangeLabel(startDate, endDate);
    }

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
      .filter((event) => isEventOnDate(event, dateStr))
      .sort(sortEventsByDurationThenStart);
  }

  function getScheduleListTitle() {
    return `${formatDateLabel(selectedDate)} 일정`;
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
    setIsAllDay(false);
    setScheduleColor(DEFAULT_EVENT_COLOR);
    setIsColorPaletteOpen(false);
    setOpenTimePicker(null);

    setIsListOpen(false);
    setIsModalOpen(true);
  }

  function openEditModal(eventData) {
    setEditingEventId(eventData.id);
    setScheduleTitle(eventData.title || "");
    setIsAllDay(eventData.isAllDay);
    setScheduleColor(eventData.color || DEFAULT_EVENT_COLOR);
    setIsColorPaletteOpen(false);
    setOpenTimePicker(null);

    if (eventData.isAllDay) {
      setStartTime(getEventStartDate(eventData));
      setEndTime(getEventEndDate(eventData));
      setIsListOpen(false);
      setIsModalOpen(true);
      return;
    }

    setStartTime(eventData.start.slice(0, 16));

    if (eventData.end) {
      setEndTime(eventData.end.slice(0, 16));
    } else {
      setEndTime(eventData.start.slice(0, 16));
    }

    setIsListOpen(false);
    setIsModalOpen(true);
  }

  function handleAllDayChange(e) {
    const checked = e.target.checked;
    const startDate = (startTime || selectedDate).slice(0, 10);
    const endDate = (endTime || startTime || selectedDate).slice(0, 10);

    setIsAllDay(checked);

    if (checked) {
      setStartTime(startDate);
      setEndTime(endDate);
      return;
    }

    setStartTime(`${startDate}T10:00`);
    setEndTime(`${endDate}T18:00`);
  }

  function handleDateClick(info) {
    openScheduleList(info.dateStr);
  }

  function getScheduleDatePart(value, fallbackDate = selectedDate) {
    return (value || fallbackDate).slice(0, 10);
  }

  function getScheduleTimePart(value, fallbackTime) {
    const time = value?.slice(11, 16);
    return time || fallbackTime;
  }

  function getScheduleHourPart(value, fallbackTime) {
    return getScheduleTimePart(value, fallbackTime).slice(0, 2);
  }

  function getScheduleMinutePart(value, fallbackTime) {
    return getScheduleTimePart(value, fallbackTime).slice(3, 5);
  }

  function handleStartDateChange(date) {
    if (isAllDay) {
      setStartTime(date);
      return;
    }

    setStartTime(`${date}T${getScheduleTimePart(startTime, "10:00")}`);
  }

  function handleStartHourChange(hour) {
    setStartTime(`${getScheduleDatePart(startTime)}T${hour}:${getScheduleMinutePart(startTime, "10:00")}`);
  }

  function handleStartMinuteChange(minute) {
    setStartTime(`${getScheduleDatePart(startTime)}T${getScheduleHourPart(startTime, "10:00")}:${minute}`);
  }

  function handleEndDateChange(date) {
    if (isAllDay) {
      setEndTime(date);
      return;
    }

    setEndTime(`${date}T${getScheduleTimePart(endTime, "18:00")}`);
  }

  function handleEndHourChange(hour) {
    setEndTime(`${getScheduleDatePart(endTime, getScheduleDatePart(startTime))}T${hour}:${getScheduleMinutePart(endTime, "18:00")}`);
  }

  function handleEndMinuteChange(minute) {
    setEndTime(`${getScheduleDatePart(endTime, getScheduleDatePart(startTime))}T${getScheduleHourPart(endTime, "18:00")}:${minute}`);
  }

  async function handleSaveSchedule(e) {
    e.preventDefault();

    const normalizedStartTime = isAllDay
      ? `${startTime.slice(0, 10)}T00:00:00+09:00`
      : `${startTime}:00+09:00`;
    const normalizedEndTime = isAllDay
      ? `${endTime.slice(0, 10)}T23:59:59+09:00`
      : `${endTime}:00+09:00`;

    if (new Date(normalizedStartTime) > new Date(normalizedEndTime)) {
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
      start_time: normalizedStartTime,
      end_time: normalizedEndTime,
      is_all_day: isAllDay,
      color: scheduleColor,
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
    setIsColorPaletteOpen(false);
    setOpenTimePicker(null);
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
    setIsColorPaletteOpen(false);
    setOpenTimePicker(null);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingEventId(null);
    setIsColorPaletteOpen(false);
    setOpenTimePicker(null);
  }

  function handleCloseList() {
    setIsListOpen(false);
    setSelectedDate("");
  }

  function renderTimePicker({ pickerId, value, options, onChange, ariaLabel }) {
    const isOpen = openTimePicker === pickerId;

    return (
      <div className="emsys-calendar-time-picker">
        <button
          className="emsys-calendar-time-trigger"
          type="button"
          onClick={() => {
            setIsColorPaletteOpen(false);
            setOpenTimePicker(isOpen ? null : pickerId);
          }}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
        >
          {value}
        </button>

        {isOpen && (
          <div className="emsys-calendar-time-menu" role="listbox" aria-label={ariaLabel}>
            {options.map((option) => (
              <button
                key={option}
                ref={option === value ? selectedTimeOptionRef : null}
                className={`emsys-calendar-time-option${option === value ? " emsys-calendar-time-option-selected" : ""}`}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpenTimePicker(null);
                }}
                role="option"
                aria-selected={option === value}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
        eventDisplay="block"
        displayEventTime={false}
        dayMaxEvents={2}
        dayCellClassNames={(info) =>
          getEventsByDate(formatDate(info.date)).length > 0
            ? ["calendar-day-has-events"]
            : []
        }
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
              <h2 className="schedule-list-title">{getScheduleListTitle()}</h2>

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
                    style={{
                      "--schedule-item-color": event.color || DEFAULT_EVENT_COLOR,
                      "--schedule-item-bg-color": event.color || DEFAULT_EVENT_COLOR,
                      "--schedule-item-text-color": event.textColor || "black",
                      cursor: canEdit ? "pointer" : "default",
                    }}
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
              <div className="emsys-calendar-title-row">
                <label className="emsys-calendar-sr-only" htmlFor="schedule-title">
                  일정 제목
                </label>
                <input
                  id="schedule-title"
                  className="emsys-calendar-title-input"
                  type="text"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="제목"
                  required
                />

                <div className="emsys-calendar-color-control">
                  <button
                    className="emsys-calendar-color-current"
                    type="button"
                    style={{ backgroundColor: scheduleColor }}
                    onClick={() => {
                      setOpenTimePicker(null);
                      setIsColorPaletteOpen((prev) => !prev);
                    }}
                    aria-label="일정 색상 선택"
                    aria-expanded={isColorPaletteOpen}
                  />

                  {isColorPaletteOpen && (
                    <div className="emsys-calendar-color-picker" aria-label="일정 색상">
                      {EVENT_COLOR_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`emsys-calendar-color-swatch${scheduleColor === option.value ? " emsys-calendar-color-swatch-selected" : ""}`}
                          style={{ backgroundColor: option.value }}
                          onClick={() => {
                            setScheduleColor(option.value);
                            setIsColorPaletteOpen(false);
                          }}
                          aria-label={`${option.label} 색상 선택`}
                          aria-pressed={scheduleColor === option.value}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label className="emsys-calendar-toggle-row">
                <span>하루 종일</span>
                <input
                  className="emsys-calendar-toggle-input"
                  type="checkbox"
                  checked={isAllDay}
                  onChange={handleAllDayChange}
                />
                <span className="emsys-calendar-toggle-track" aria-hidden="true">
                  <span className="emsys-calendar-toggle-thumb" />
                </span>
              </label>

              <div className="emsys-calendar-date-row">
                <label className="emsys-calendar-date-field">
                  <span>시작 날짜</span>
                  <input
                    className="emsys-calendar-date-input"
                    type="date"
                    value={startTime.slice(0, 10)}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                  {!isAllDay && (
                    <div className="emsys-calendar-time-row">
                      {renderTimePicker({
                        pickerId: "start-hour",
                        value: getScheduleHourPart(startTime, "10:00"),
                        options: HOUR_OPTIONS,
                        onChange: handleStartHourChange,
                        ariaLabel: "시작 시",
                      })}
                      <span className="emsys-calendar-time-unit">시</span>
                      {renderTimePicker({
                        pickerId: "start-minute",
                        value: getScheduleMinutePart(startTime, "10:00"),
                        options: MINUTE_OPTIONS,
                        onChange: handleStartMinuteChange,
                        ariaLabel: "시작 분",
                      })}
                      <span className="emsys-calendar-time-unit">분</span>
                    </div>
                  )}
                </label>

                <span className="emsys-calendar-date-divider" aria-hidden="true">
                  →
                </span>

                <label className="emsys-calendar-date-field">
                  <span>종료 날짜</span>
                  <input
                    className="emsys-calendar-date-input"
                    type="date"
                    value={endTime.slice(0, 10)}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    required
                  />
                  {!isAllDay && (
                    <div className="emsys-calendar-time-row">
                      {renderTimePicker({
                        pickerId: "end-hour",
                        value: getScheduleHourPart(endTime, "18:00"),
                        options: HOUR_OPTIONS,
                        onChange: handleEndHourChange,
                        ariaLabel: "종료 시",
                      })}
                      <span className="emsys-calendar-time-unit">시</span>
                      {renderTimePicker({
                        pickerId: "end-minute",
                        value: getScheduleMinutePart(endTime, "18:00"),
                        options: MINUTE_OPTIONS,
                        onChange: handleEndMinuteChange,
                        ariaLabel: "종료 분",
                      })}
                      <span className="emsys-calendar-time-unit">분</span>
                    </div>
                  )}
                </label>
              </div>

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
