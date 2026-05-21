const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. 일정 전체 조회
exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.events.findMany();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("일정 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 2. 관리자 일정 추가
exports.createEvent = async (req, res) => {
  try {
    const { title, start_time, end_time } = req.body;
    
    const newEvent = await prisma.events.create({
      data: {
        title,
        start_time: new Date(start_time),
        end_time: end_time ? new Date(end_time) : null
      }
    });
    res.status(201).json({ success: true, message: "일정이 등록되었습니다.", data: newEvent });
  } catch (error) {
    console.error("일정 등록 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 3. 관리자 일정 삭제
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.events.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ success: true, message: "일정이 정상적으로 삭제되었습니다." });
  } catch (error) {
    console.error("일정 삭제 에러:", error);
    res.status(500).json({ success: false, message: "이미 삭제되었거나 존재하지 않는 일정입니다." });
  }
};

// 4. 활동 기록 엑셀 추출용 기간 데이터 검색
exports.getEventsForExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const events = await prisma.events.findMany({
      where: {
        start_time: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { start_time: 'asc' }
    });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("엑셀 데이터 추출 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};