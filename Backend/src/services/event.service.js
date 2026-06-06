const prisma = require('../lib/prisma');

// 일정 전체 조회
exports.getAllEvents = async () => {
  return await prisma.events.findMany({
    orderBy: { start_time: 'asc' }
  });
};

// 관리자 일정 추가
exports.createEvent = async ({ title, start_time, end_time }) => {
  return await prisma.events.create({
    data: {
      title,
      start_time: new Date(start_time),
      end_time: end_time ? new Date(end_time) : null
    }
  });
};

// 일정 수정
exports.updateEvent = async (id, { title, start_time, end_time }) => {
  return await prisma.events.update({
    where: { id: parseInt(id) },
    data: {
      title,
      start_time: new Date(start_time),
      end_time: end_time ? new Date(end_time) : null
    }
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