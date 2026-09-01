const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatMaintenanceDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[date.getDay()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day}(${weekday}) ${hours}:${minutes}`;
}

function formatTimeOnly(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatMaintenancePeriod(post) {
  const startText = formatMaintenanceDateTime(post?.maintenance_start_at);
  const startDate = post?.maintenance_start_at
    ? new Date(post.maintenance_start_at)
    : null;
  const endDate = post?.maintenance_end_at
    ? new Date(post.maintenance_end_at)
    : null;

  if (
    !startText ||
    !startDate ||
    !endDate ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "";
  }

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  const endText = isSameDay
    ? formatTimeOnly(endDate)
    : formatMaintenanceDateTime(endDate);

  return `${startText} ~ ${endText}`;
}
