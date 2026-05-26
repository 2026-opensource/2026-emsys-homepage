import React, { useState, useEffect } from 'react';
import { Upload, BarChart2 } from 'lucide-react';
import '../../styles/FinanceStats.css'; 

const FinanceStats = () => {
    const [chartData, setChartData] = useState([]);
    const [financeHeadline, setFinanceHeadline] = useState({ title: '데이터를 로드하는 중입니다...', subtitle: '' });
    const [excelFile, setExcelFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // 통계 데이터 패치 로직
    const fetchFinanceStats = async () => {
        try {
            const response = await fetch('/api/finance/stats?months=12');
            const resData = await response.json();
            if (resData.success) {
                setChartData(resData.data.chartData);
                setFinanceHeadline(resData.data.headline);
            }
        } catch (error) {
            console.error("회계 데이터 로드 실패:", error);
        }
    };

    useEffect(() => {
        fetchFinanceStats();
    }, []);

    // 엑셀 업로드 핸들러
    const handleExcelUpload = async () => {
        if (!excelFile) return alert('업로드할 엑셀 파일을 선택해주세요.');
        
        const formData = new FormData();
        formData.append('file', excelFile);

        setIsUploading(true);
        try {
            const response = await fetch('/api/finance/upload', {
                method: 'POST',
                body: formData,
            });
            const resData = await response.json();
            if (resData.success) {
                alert(resData.message);
                setExcelFile(null);
                fetchFinanceStats(); 
            } else {
                alert(resData.message);
            }
        } catch (error) {
            console.error("엑셀 업로드 실패:", error);
            alert("파일 처리 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    // 금액 천단위 포맷터
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    };

    return (
        <div className="finance-inside-content">
            {/* 헤더 피드백 메세지 */}
            <div className="finance-headline-box">
                <h4 className="finance-title">{financeHeadline.title}</h4>
                <p className="finance-subtitle">{financeHeadline.subtitle}</p>
            </div>

            {/* 차트 영역 */}
            <div className="finance-chart-container">
                {chartData.length === 0 ? (
                    <div className="finance-empty-text">
                        통계 데이터가 없습니다. 아래에서 엑셀을 업로드해주세요.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <XAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 10000)}만`} />
                            <Tooltip formatter={(v) => [formatCurrency(v), '지출액']} contentStyle={{ fontSize: '12px', borderRadius: '4px' }} />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#4fd1c5' : '#cbd5e0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 엑셀 파일 업로드 컨트롤러 */}
            <div className="finance-upload-wrapper">
                <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    id="inside-excel-file" 
                    className="finance-hidden-input"
                    onChange={(e) => setExcelFile(e.target.files[0])}
                />
                <label htmlFor="inside-excel-file" className="finance-excel-label">
                    {excelFile ? excelFile.name : '지출 내역 엑셀 파일 선택'}
                </label>
                <button 
                    className="apply-btn finance-upload-btn" 
                    onClick={handleExcelUpload}
                    disabled={isUploading || !excelFile}
                >
                    <Upload size={14} />
                    {isUploading ? '중...' : '업로드'}
                </button>
            </div>
        </div>
    );
};

export default FinanceStats;