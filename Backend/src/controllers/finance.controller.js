const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. 회비/지출 내역 전체 조회
exports.getAllFinances = async (req, res) => {
  try {
    const finances = await prisma.finances.findMany({
      orderBy: { target_date: 'desc' }
    });
    res.status(200).json({ success: true, data: finances });
  } catch (error) {
    console.error("회비 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 2. 새로운 내역 수동 추가
exports.createFinanceItem = async (req, res) => {
  try {
    const { target_date, item_name, amount, category } = req.body;
    
    const newItem = await prisma.finances.create({
      data: {
        target_date: target_date ? new Date(target_date) : null,
        item_name,
        amount: parseInt(amount),
        category
      }
    });
    res.status(201).json({ success: true, message: "회비 내역이 기록되었습니다.", data: newItem });
  } catch (error) {
    console.error("회비 등록 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};