const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const XLSX = require('xlsx');

// 1. 엑셀 파일 업로드
exports.uploadFinanceExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "엑셀 파일을 업로드해주세요." 
      });
    }
    
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const monthlyExpenses = {};
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    for (let rowNum = 6; rowNum <= range.e.r; rowNum++) {
      try {
        const dateCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];
        const typeCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 4 })];
        const amountCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 5 })];
        
        if (!dateCell || !dateCell.v) continue;
        
        const typeStr = typeCell && typeCell.v ? typeCell.v.toString().trim() : '';
        if (typeStr !== '출금') continue;
        
        const dateStr = dateCell.v.toString().trim();
        const [year, month, day] = dateStr.split('.').map(s => parseInt(s));
        
        if (!year || !month || !day) continue;
        
        const amount = amountCell && amountCell.v ? parseInt(amountCell.v) : 0;
        if (amount === 0) continue;
        
        // 월별 집계
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = { year, month, total: 0 };
        }
        monthlyExpenses[monthKey].total += amount;
        
      } catch (rowError) {
        console.error(`${rowNum + 1}행 처리 에러:`, rowError.message);
      }
    }
    
    const financeRecords = [];
    
    // 월별 저장
    for (const [monthKey, data] of Object.entries(monthlyExpenses)) {
      const targetDate = new Date(data.year, data.month - 1, 1);
      const record = await prisma.finances.create({
        data: {
          target_date: targetDate,
          item_name: `${data.year}년 ${data.month}월 총 지출`,
          amount: data.total,
          category: '월별지출'
        }
      });
      financeRecords.push(record);
    }
    
    res.status(201).json({ 
      success: true, 
      message: `월별 ${Object.keys(monthlyExpenses).length}개 지출 내역이 등록되었습니다.`,
      data: {
        monthlyCount: Object.keys(monthlyExpenses).length,
        records: financeRecords
      }
    });
  } catch (error) {
    console.error("엑셀 업로드 에러:", error);
    res.status(500).json({ 
      success: false, 
      message: "엑셀 파일 처리 중 오류가 발생했습니다.",
      error: error.message 
    });
  }
};

// 2. 월별 통계 데이터
exports.getFinanceStats = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const monthCount = parseInt(months);
    
    // 모든 월별 데이터 조회
    const allMonthlyData = await prisma.finances.findMany({
      where: { category: '월별지출' },
      orderBy: { target_date: 'desc' }
    });
    
    // 최근 N개월 데이터만 사용
    const recentData = allMonthlyData.slice(0, monthCount).reverse();
    
    if (recentData.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          headline: {
            title: "아직 지출 내역이 없어요",
            subtitle: "엑셀 파일을 업로드해주세요"
          },
          chartData: []
        }
      });
    }
    
    // 차트 데이터 생성
    const chartData = [];
    for (const item of recentData) {
      const itemDate = new Date(item.target_date);
      const year = itemDate.getFullYear();
      const month = itemDate.getMonth() + 1;
      
      // 현재 날짜의 연월
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      chartData.push({
        label: `${year}.${month}`,
        amount: item.amount,
        isCurrent: (year === currentYear && month === currentMonth)
      });
    }
    
    // 헤드라인 계산
    const currentMonthData = chartData[chartData.length - 1];
    const lastMonthData = chartData[chartData.length - 2];
    
    const currentTotal = currentMonthData ? currentMonthData.amount : 0;
    const lastTotal = lastMonthData ? lastMonthData.amount : 0;
    const difference = currentTotal - lastTotal;
    
    const avgAmount = Math.round(
      chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length
    );
    
    const headline = {
      title: difference < 0 
        ? `이번 달은 ${Math.abs(Math.round(difference / 10000))}만원 덜 썼어요`
        : difference > 0
        ? `이번 달은 ${Math.round(difference / 10000)}만원 더 썼어요`
        : `이번 달은 지난달과 비슷하게 썼어요`,
      subtitle: `한달에 평균 ${Math.round(avgAmount / 10000)}만원 정도 써요`
    };
    
    res.status(200).json({
      success: true,
      data: {
        headline,
        chartData
      }
    });
  } catch (error) {
    console.error("통계 조회 에러:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};