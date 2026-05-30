const financeService = require('../services/finance.service');

exports.uploadFinanceExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "엑셀 파일을 업로드해주세요." });
    }
    const result = await financeService.processAndSaveExcel(req.file.buffer, req.file.originalname);
    res.status(201).json({
      success: true,
      message: `${result.semester} ${result.monthlyCount}개월 지출 내역이 등록되었습니다.`,
      data: result
    });
  } catch (error) {
    console.error("엑셀 업로드 에러:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSemesterStats = async (req, res) => {
  try {
    const data = await financeService.getSemesterStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("학기별 통계 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const { semester } = req.query;
    if (!semester) {
      return res.status(400).json({ success: false, message: "semester 파라미터가 필요합니다." });
    }
    const data = await financeService.getMonthlyStats(semester);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("월별 통계 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

exports.getAvailableSemesters = async (req, res) => {
  try {
    const semesters = await financeService.getAvailableSemesters();
    res.status(200).json({ success: true, data: semesters });
  } catch (error) {
    console.error("학기 목록 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};
