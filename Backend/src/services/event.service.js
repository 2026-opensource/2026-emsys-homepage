const prisma = require('../lib/prisma');

const DEFAULT_EVENT_COLOR = '#5cffc7';
const EVENT_COLORS = new Set([
  '#5cffc7',
  '#6eea85',
  '#67dfff',
  '#82b7ff',
  '#b498ff',
  '#ff8ac8',
  '#ffae5c',
  '#ffdf4d',
  '#ff8a8a',
  '#cbd5e1',
]);
let eventMetadataColumnsReady;

function normalizeEventColor(color) {
  return EVENT_COLORS.has(color) ? color : DEFAULT_EVENT_COLOR;
}

function normalizeAllDay(value) {
  return value === true || value === 'true';
}

async function ensureEventMetadataColumns() {
  if (!eventMetadataColumnsReady) {
    eventMetadataColumnsReady = (async () => {
      const columns = await prisma.$queryRaw`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'events'
          AND COLUMN_NAME IN ('is_all_day', 'color')
      `;
      const columnNames = new Set(columns.map((column) => column.COLUMN_NAME));

      if (!columnNames.has('is_all_day')) {
        await prisma.$executeRaw`
          ALTER TABLE events
          ADD COLUMN is_all_day BOOLEAN NOT NULL DEFAULT false
        `;
      }

      if (!columnNames.has('color')) {
        await prisma.$executeRaw`
          ALTER TABLE events
          ADD COLUMN color VARCHAR(20) NULL DEFAULT '#00ffa3'
        `;
      }
    })();
  }

  return eventMetadataColumnsReady;
}

// 일정 전체 조회
exports.getAllEvents = async () => {
  await ensureEventMetadataColumns();

  return await prisma.$queryRaw`
    SELECT id, title, start_time, end_time, is_all_day, color, created_at
    FROM events
    ORDER BY start_time ASC
  `;
};

// 관리자 일정 추가
exports.createEvent = async ({ title, start_time, end_time, is_all_day, color }) => {
  await ensureEventMetadataColumns();

  return await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO events (title, start_time, end_time, is_all_day, color)
      VALUES (
        ${title},
        ${new Date(start_time)},
        ${end_time ? new Date(end_time) : null},
        ${normalizeAllDay(is_all_day)},
        ${normalizeEventColor(color)}
      )
    `;

    const [event] = await tx.$queryRaw`
      SELECT id, title, start_time, end_time, is_all_day, color, created_at
      FROM events
      WHERE id = LAST_INSERT_ID()
    `;

    return event;
  });
};

// 일정 수정
exports.updateEvent = async (id, { title, start_time, end_time, is_all_day, color }) => {
  await ensureEventMetadataColumns();

  return await prisma.$transaction(async (tx) => {
    const updatedCount = await tx.$executeRaw`
      UPDATE events
      SET
        title = ${title},
        start_time = ${new Date(start_time)},
        end_time = ${end_time ? new Date(end_time) : null},
        is_all_day = ${normalizeAllDay(is_all_day)},
        color = ${normalizeEventColor(color)}
      WHERE id = ${parseInt(id)}
    `;

    if (updatedCount === 0) {
      const error = new Error('Event not found');
      error.code = 'P2025';
      throw error;
    }

    const [event] = await tx.$queryRaw`
      SELECT id, title, start_time, end_time, is_all_day, color, created_at
      FROM events
      WHERE id = ${parseInt(id)}
    `;

    return event;
  });
};

// 관리자 일정 삭제
exports.deleteEvent = async (id) => {
  return await prisma.events.delete({
    where: { id: parseInt(id) }
  });
};

// 활동 기록 엑셀 추출용 기간 데이터 검색
exports.getEventsForExcel = async ({ startDate, endDate }) => {
  return await prisma.events.findMany({
    where: {
      start_time: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    orderBy: { start_time: 'asc' }
  });
};
