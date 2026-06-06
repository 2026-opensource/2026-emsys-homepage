const eventService = require('../services/event.service');

// 일정 전체 조회
exports.getAllEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("일정 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 관리자 일정 추가
exports.createEvent = async (req, res) => {
  try {
    const { title, start_time, end_time } = req.body;
    if (!title || !start_time) {
      return res.status(400).json({ success: false, message: "제목과 시작 시간은 필수입니다." });
    }
    const newEvent = await eventService.createEvent({ title, start_time, end_time });
    res.status(201).json({ success: true, message: "일정이 등록되었습니다.", data: newEvent });
  } catch (error) {
    console.error("일정 등록 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

//  일정 수정
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_time, end_time } = req.body;
    if (!title || !start_time) {
      return res.status(400).json({ success: false, message: "제목과 시작 시간은 필수입니다." });
    }
    const updatedEvent = await eventService.updateEvent(id, { title, start_time, end_time });
    res.status(200).json({ success: true, message: "일정이 수정되었습니다.", data: updatedEvent });
  } catch (error) {
    console.error("일정 수정 에러:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: "일정을 찾을 수 없습니다." });
    }
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 관리자 일정 삭제
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    res.status(200).json({ success: true, message: "일정이 정상적으로 삭제되었습니다." });
  } catch (error) {
    console.error("일정 삭제 에러:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: "일정을 찾을 수 없습니다." });
    }
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 활동 기록 엑셀 추출용 기간 데이터 검색
exports.getEventsForExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "시작일과 종료일을 입력해주세요." });
    }
    const events = await eventService.getEventsForExcel({ startDate, endDate });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("엑셀 데이터 추출 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};