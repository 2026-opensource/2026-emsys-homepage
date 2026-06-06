import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import '../../styles/financeStats.css';

const FinanceStats = () => {
    const [activeTab, setActiveTab] = useState('semester');        // 'semester' | 'monthly'
    const [semesters, setSemesters] = useState([]);                // 사용 가능한 학기 목록
    const [selectedSemester, setSelectedSemester] = useState(null); // 월별 탭에서 선택된 학기

    const [chartData, setChartData] = useState([]);
    const [headline, setHeadline] = useState({ title: '데이터를 로드하는 중입니다...', subtitle: '' });

    const [excelFile, setExcelFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const token = localStorage.getItem('accessToken');

    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 학기 목록 조회
    const fetchSemesters = async () => {
        try {
            const res = await fetch('/api/finance/semesters', { headers: authHeader });
            const data = await res.json();
            if (data.success) {
                setSemesters(data.data);
                // 월별 탭 기본 선택: 가장 최신 학기
                if (data.data.length > 0) setSelectedSemester(data.data[data.data.length - 1]);
            }
        } catch (e) {
            console.error('학기 목록 로드 실패:', e);
        }
    };

    // 학기별 통계 조회
    const fetchSemesterStats = async () => {
        try {
            const res = await fetch('/api/finance/stats/semester', { headers: authHeader });
            const data = await res.json();
            if (data.success) {
                setChartData(data.data.chartData);
                setHeadline(data.data.headline);
            }
        } catch (e) {
            console.error('학기별 통계 로드 실패:', e);
        }
    };

    // 월별 통계 조회
    const fetchMonthlyStats = async (semester) => {
        try {
            const res = await fetch(
                `/api/finance/stats/monthly?semester=${encodeURIComponent(semester)}`,
                { headers: authHeader }
            );
            const data = await res.json();
            if (data.success) {
                setChartData(data.data.chartData);
                setHeadline(data.data.headline);
            }
        } catch (e) {
            console.error('월별 통계 로드 실패:', e);
        }
    };

    // 탭 전환 시 데이터 로드
    useEffect(() => {
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (activeTab === 'semester') {
            fetchSemesterStats();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'monthly' && selectedSemester) {
            fetchMonthlyStats(selectedSemester);
        }
    }, [activeTab, selectedSemester]);

    // 엑셀 업로드
    const handleExcelUpload = async () => {
        if (!excelFile) return alert('업로드할 엑셀 파일을 선택해주세요.');

        const formData = new FormData();
        formData.append('file', excelFile);

        setIsUploading(true);
        try {
            const res = await fetch('/api/finance/upload', {
                method: 'POST',
                headers: authHeader,
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setExcelFile(null);
                // 업로드 후 학기 목록 + 현재 탭 데이터 갱신
                await fetchSemesters();
                if (activeTab === 'semester') fetchSemesterStats();
                else if (selectedSemester) fetchMonthlyStats(selectedSemester);
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error('엑셀 업로드 실패:', e);
            alert('파일 처리 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            e.target.value = '';
            return;
        }

        setExcelFile(file);
    };

    return (
        <div className="finance-inside-content">

            {/* 학기별 / 월별 탭 구분 */}
            <div className="finance-tab-wrapper">
                <button
                    className={`finance-tab-btn ${activeTab === 'semester' ? 'active' : ''}`}
                    onClick={() => setActiveTab('semester')}
                >
                    학기별
                </button>
                <button
                    className={`finance-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monthly')}
                >
                    월별
                </button>
            </div>

            {/* 월별 탭일 때 학기 선택 탭 */}
            {activeTab === 'monthly' && semesters.length > 0 && (
                <div className="finance-semester-tab-wrapper">
                    {semesters.map(sem => (
                        <button
                            key={sem}
                            className={`finance-semester-tab-btn ${selectedSemester === sem ? 'active' : ''}`}
                            onClick={() => setSelectedSemester(sem)}
                        >
                            {sem}
                        </button>
                    ))}
                </div>
            )}

            {/* 헤드라인 */}
            <div className="finance-headline-box">
                <h4 className="finance-title">{headline.title}</h4>
                <p className="finance-subtitle">{headline.subtitle}</p>
            </div>

            {/* 차트 */}
            <div className="finance-chart-container">
                {chartData.length === 0 ? (
                    <div className="finance-empty-text">
                        통계 데이터가 없습니다. 아래에서 엑셀을 업로드해주세요.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <XAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false}
                                tickFormatter={(v) => `${Math.round(v / 10000)}만`} />
                            <Tooltip
                                formatter={(v) => [formatCurrency(v), '지출액']}
                                contentStyle={{ fontSize: '12px', borderRadius: '4px', padding: '4px 8px' }}
                                animationDuration={0}
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === chartData.length - 1 ? '#00ffa3' : '#7a928a'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 엑셀 업로드 */}
            <div className="finance-upload-wrapper">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    id="inside-excel-file"
                    className="finance-hidden-input"
                    onChange={handleFileChange}
                />

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