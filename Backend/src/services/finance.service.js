const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

const parseSemesterFromFilename = (filename) => {
    const match = filename.match(/(\d{4})_(\d)/);
    if (!match) return null;
    return `${match[1].slice(2)}년도 ${match[2]}학기`;
};

// 학기 정렬용 숫자 
const semesterToNumber = (semester) => {
    const match = semester.match(/(\d{2})년도 (\d)학기/);
    if (!match) return 0;
    return parseInt(match[1]) * 10 + parseInt(match[2]);
};

// 이전 학기 계산
const getPrevSemester = (semester) => {
    const match = semester.match(/(\d{2})년도 (\d)학기/);
    if (!match) return null;
    const year = parseInt(match[1]);
    const term = parseInt(match[2]);
    if (term === 2) return `${year}년도 1학기`;
    return `${year - 1}년도 2학기`;
};

// 엑셀 파일 명에서 파싱
exports.processAndSaveExcel = async (fileBuffer, filename) => {
    const decodedFilename = Buffer.from(filename, 'latin1').toString('utf8');
    console.log('변환된 파일명:', decodedFilename);

    const semester = parseSemesterFromFilename(filename);
    if (!semester) {
        throw new Error('파일명 형식이 올바르지 않습니다. (예: EMSYS_회비사용내역_2024_2학기.xlsx)');
    }

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const monthlyExpenses = {};
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let rowNum = 1; rowNum <= range.e.r; rowNum++) {
        try {
            const dateCell   = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];
            const typeCell   = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 4 })];
            const amountCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 5 })];

            if (!dateCell?.v) continue;

            const typeStr = typeCell?.v?.toString().trim() ?? '';
            if (typeStr !== '출금') continue;

            const dateStr = dateCell.v.toString().trim();
            const [year, month, day] = dateStr.split('.').map(s => parseInt(s));
            if (!year || !month || !day) continue;

            const amount = amountCell?.v ? parseInt(amountCell.v) : 0;
            if (amount === 0) continue;

            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            if (!monthlyExpenses[monthKey]) {
                monthlyExpenses[monthKey] = { year, month, total: 0 };
            }
            monthlyExpenses[monthKey].total += amount;

        } catch (rowError) {
            console.error(`${rowNum + 1}행 처리 에러:`, rowError.message);
        }
    }

    // 같은 학기 기존 데이터 삭제 후 재등록
    await prisma.finances.deleteMany({
        where: { semester, category: '월별지출' }
    });

    const financeRecords = [];
    for (const [, data] of Object.entries(monthlyExpenses)) {
        const record = await prisma.finances.create({
            data: {
                target_date: new Date(data.year, data.month - 1, 1),
                item_name: `${data.year}년 ${data.month}월 총 지출`,
                amount: data.total,
                category: '월별지출',
                semester
            }
        });
        financeRecords.push(record);
    }

    // 최근 6학기 초과하는 학기 삭제
    await exports.deleteOldSemesters();

    return {
        semester,
        monthlyCount: Object.keys(monthlyExpenses).length,
        records: financeRecords
    };
};

// 최근 6학기 초과 데이터 삭제
exports.deleteOldSemesters = async () => {
    const rows = await prisma.finances.findMany({
        where: { category: '월별지출' },
        select: { semester: true },
        distinct: ['semester'],
    });

    // 학기 정렬 (최신순으로)
    const sorted = rows
        .map(r => r.semester)
        .filter(Boolean)
        .sort((a, b) => semesterToNumber(b) - semesterToNumber(a));

    // 7번째 이후 오래된 학기 삭제
    const toDelete = sorted.slice(6);
    for (const semester of toDelete) {
        await prisma.finances.deleteMany({
            where: { semester, category: '월별지출' }
        });
    }
};

// 학기별 총지출 통계 (최근 6학기)
exports.getSemesterStats = async () => {
    const rows = await prisma.finances.findMany({
        where: { category: '월별지출' },
        select: { semester: true },
        distinct: ['semester'],
    });

    const semesters = rows
        .map(r => r.semester)
        .filter(Boolean)
        .sort((a, b) => semesterToNumber(a) - semesterToNumber(b))
        .slice(-6);

    const chartData = [];
    for (const sem of semesters) {
        const data = await prisma.finances.findMany({
            where: { semester: sem, category: '월별지출' }
        });
        const total = data.reduce((sum, d) => sum + (d.amount ?? 0), 0);
        chartData.push({ label: sem, amount: total });
    }

    // 마지막 두 학기 비교 (헤드라인 문구)
    const lastTotal = chartData.at(-1)?.amount ?? 0;
    const prevTotal = chartData.at(-2)?.amount ?? 0;
    const diff = lastTotal - prevTotal;

    const headline = {
        title: diff < 0
            ? `이번 학기는 지난 학기보다 ${Math.abs(Math.round(diff / 10000))}만원 덜 썼어요`
            : diff > 0
            ? `이번 학기는 지난 학기보다 ${Math.round(diff / 10000)}만원 더 썼어요`
            : `이번 학기는 지난 학기와 비슷하게 썼어요`,
        subtitle: `학기 평균 ${Math.round(chartData.reduce((s, d) => s + d.amount, 0) / chartData.length / 10000)}만원 지출`
    };

    return { headline, chartData };
};

// 특정 학기 월별 통계
exports.getMonthlyStats = async (semester) => {
    const data = await prisma.finances.findMany({
        where: { semester, category: '월별지출' },
        orderBy: { target_date: 'asc' }
    });

    if (data.length === 0) {
        return {
            headline: { title: "아직 지출 내역이 없어요", subtitle: "엑셀 파일을 업로드해주세요" },
            chartData: []
        };
    }

    const chartData = data.map(item => {
        const d = new Date(item.target_date);
        return {
            label: `${d.getFullYear()}.${d.getMonth() + 1}`,
            amount: item.amount ?? 0,
        };
    });

    const lastTotal = chartData.at(-1)?.amount ?? 0;
    const prevTotal = chartData.at(-2)?.amount ?? 0;
    const diff = lastTotal - prevTotal;
    const lastLabel = chartData.at(-1).label.split('.')[1];
    const prevLabel = chartData.at(-2)?.label.split('.')[1];

    const headline = {
        title: diff < 0
            ?  `${lastLabel}월은 ${prevLabel}월보다 ${Math.abs(Math.round(diff / 10000))}만원 덜 썼어요`
            : diff > 0
            ? `${lastLabel}월은 ${prevLabel}월보다 ${Math.round(diff / 10000)}만원 더 썼어요`
            : `${lastLabel}월은 ${prevLabel}월이랑 비슷하게 썼어요`,
        subtitle: `이번 학기 월평균 ${Math.round(chartData.reduce((s, d) => s + d.amount, 0) / chartData.length / 10000)}만원 지출`
    };

    return { headline, chartData };
};

// 사용 가능한 학기 목록 (최신순으로)
exports.getAvailableSemesters = async () => {
    const rows = await prisma.finances.findMany({
        where: { category: '월별지출' },
        select: { semester: true },
        distinct: ['semester'],
    });

    return rows
        .map(r => r.semester)
        .filter(Boolean)
        .sort((a, b) => semesterToNumber(a) - semesterToNumber(b))
        .slice(0, 6);
};