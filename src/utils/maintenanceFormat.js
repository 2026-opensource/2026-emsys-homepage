const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KOREA_DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function getKoreanDateTimeParts(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return Object.fromEntries(
    KOREA_DATE_TIME_FORMAT.formatToParts(date).map(({ type, value: part }) => [type, part]),
  );
}

export function formatMaintenanceInputValue(value) {
  const parts = getKoreanDateTimeParts(value);
  if (!parts) return "";

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function formatMaintenanceDateTime(parts) {
  const weekday = WEEKDAYS[new Date(Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
  )).getUTCDay()];

  return `${parts.month}.${parts.day}(${weekday}) ${parts.hour}:${parts.minute}`;
}

export function formatMaintenancePeriod(post) {
  const start = getKoreanDateTimeParts(post?.maintenance_start_at);
  const end = getKoreanDateTimeParts(post?.maintenance_end_at);
  if (!start || !end) return "";

  const isSameDay =
    start.year === end.year &&
    start.month === end.month &&
    start.day === end.day;

  const endText = isSameDay
    ? `${end.hour}:${end.minute}`
    : formatMaintenanceDateTime(end);

  return `${formatMaintenanceDateTime(start)} ~ ${endText}`;
}
