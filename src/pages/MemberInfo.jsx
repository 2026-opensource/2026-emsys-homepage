import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../layout/Nav';
import Footer from '../layout/Footer';
import { Upload, Plus, Pencil, Trash2, X } from 'lucide-react';
import {
    fetchInvitationMembers,
    createInvitationMember,
    updateInvitationMember,
    deleteInvitationMember,
    uploadInvitationExcel,
} from '../api/memberInfoAPI.js';
import { isAuthError, redirectToLogin } from '../utils/token';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/pagination.jsx';
import '../layout/common.css';
import '../styles/memberInfo.css';

const PAGE_SIZE = 15;

const emptyForm = { name: '', student_id: '', phone: '' };

const MemberInfo = () => {
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'joined' | 'pending'

    const [excelFile, setExcelFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // null이면 신규 등록
    const [form, setForm] = useState(emptyForm);

    const loadMembers = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchInvitationMembers({
                page: currentPage,
                pageSize: PAGE_SIZE,
                search,
                status: statusFilter,
            });
            setMembers(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (error) {
            console.error('회원 정보 로드 실패:', error);
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
            alert('서버와 연결할 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search, statusFilter, navigate]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    // 검색어 바뀌면 1페이지로
    const handleSearchChange = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    // 등록/수정 폼 열기
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setIsFormOpen(true);
    };

    const openEditForm = (member) => {
        setEditingId(member.id);
        setForm({
            name: member.name || '',
            student_id: member.student_id || '',
            phone: member.phone || '',
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSubmitForm = async () => {
        const { name, student_id, phone } = form;

        if (!name.trim() || !student_id.trim() || !phone.trim()) {
            return alert('이름, 학번, 전화번호를 모두 입력해주세요.');
        }

        const phonePattern = /^01[0-9]{8,9}$/;
        if (!phonePattern.test(phone.replace(/-/g, ''))) {
            return alert('전화번호 형식을 확인해주세요. (예: 01012345678)');
        }

        try {
            if (editingId) {
                await updateInvitationMember(editingId, {
                    name: name.trim(),
                    student_id: student_id.trim(),
                    phone: phone.replace(/-/g, ''),
                });
                alert('수정되었습니다.');
            } else {
                await createInvitationMember({
                    name: name.trim(),
                    student_id: student_id.trim(),
                    phone: phone.replace(/-/g, ''),
                });
                alert('등록되었습니다. 초대코드가 자동 발급되었습니다.');
            }

            closeForm();
            await loadMembers();
        } catch (error) {
            console.error('저장 실패:', error);
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
            alert(error.response?.data?.message || '저장에 실패했습니다.');
        }
    };

    const handleDelete = async (member) => {
        if (!window.confirm(`${member.name} (${member.student_id}) 정보를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteInvitationMember(member.id);
            await loadMembers();
        } catch (error) {
            console.error('삭제 실패:', error);
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
            alert('삭제에 실패했습니다.');
        }
    };

    // 엑셀 업로드
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            e.target.value = '';
            return;
        }

        setExcelFile(file);
    };

    const handleExcelUpload = async () => {
        if (!excelFile) return alert('업로드할 엑셀 파일을 선택해주세요.');

        const formData = new FormData();
        formData.append('file', excelFile);

        setIsUploading(true);
        try {
            const res = await uploadInvitationExcel(formData);
            alert(
                `엑셀 처리 완료\n신규 등록: ${res.data?.created ?? 0}건\n중복 건너뜀: ${res.data?.skipped ?? 0}건`
            );
            setExcelFile(null);
            document.getElementById('member-excel-input').value = '';
            setCurrentPage(1);
            await loadMembers();
        } catch (error) {
            console.error('엑셀 업로드 실패:', error);
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
            alert(error.response?.data?.message || '엑셀 처리 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatPhone = (phone) => {
        if (!phone) return '';
        const digits = phone.replace(/[^0-9]/g, '');

        if (digits.length === 11) {
            // 010-1234-5678
            return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        if (digits.length === 10) {
            // 010-123-4567 (구형 번호 등)
            return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return phone; // 형식에 안 맞으면 원본 그대로
    };

    return (
        <>
            <Navbar />
            <div className="admin-page">
                <div className="admin-main">
                    <div className="admin-box member-info-content">

                        <div className="admin-section-header">
                            <h2 className="admin-box-title">
                                <i className="fa-solid fa-address-book"></i> 부원정보 관리
                            </h2>
                        </div>

                        {/* 검색 + 필터 + 등록 */}
                        <div className="member-info-controls-row">
                            <div className="modal-search-input-group member-info-search">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="이름 또는 학번 검색"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>

                            <select
                                className="form-control member-info-status-select"
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="all">전체</option>
                                <option value="joined">가입완료</option>
                                <option value="pending">미가입</option>
                            </select>

                            <button className="apply-btn member-info-add-btn" onClick={openCreateForm}>
                                <Plus size={14} /> 회원 등록
                            </button>
                        </div>

                        {/* 엑셀 업로드 */}
                        <div className="member-info-upload-row">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                id="member-excel-input"
                                className="finance-hidden-input"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="member-excel-input" className="member-info-file-label">
                                {excelFile ? excelFile.name : '엑셀 파일 선택 (학번/이름/전화번호 열 포함)'}
                            </label>

                            <button
                                className="apply-btn member-info-upload-btn"
                                onClick={handleExcelUpload}
                                disabled={isUploading || !excelFile}
                            >
                                <Upload size={14} />
                                {isUploading ? '업로드 중...' : '업로드'}
                            </button>
                        </div>

                        {/* 목록 테이블 */}
                        <div className="member-info-table-wrapper">
                            {isLoading ? (
                                <p className="empty-text" style={{ padding: '30px 0' }}>불러오는 중입니다...</p>
                            ) : members.length === 0 ? (
                                <p className="empty-text" style={{ padding: '30px 0' }}>조건에 맞는 회원이 없습니다.</p>
                            ) : (
                                <table className="member-info-table">
                                    <thead>
                                        <tr>
                                            <th>이름</th>
                                            <th>학번</th>
                                            <th>전화번호</th>
                                            <th>초대코드</th>
                                            <th>가입상태</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member) => (
                                            <tr key={member.id}>
                                                <td>
                                                    {member.name}
                                                    {member.status && (
                                                        <span className={`status-badge ${member.status === '졸업생' || member.status === '휴학생' ? 'gray' : 'mint'}`}>
                                                            {member.status.charAt(0)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{member.student_id}</td>
                                                <td>{formatPhone(member.phone)}</td>
                                                <td className="member-info-code">{member.code}</td>
                                                <td>
                                                    <span className={`status-badge ${member.is_used ? 'mint' : 'gray'}`}>
                                                        {member.is_used ? '가입완료' : '미가입'}
                                                    </span>
                                                </td>
                                                <td className="member-info-actions">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => openEditForm(member)}
                                                        title="수정"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        className="icon-btn danger"
                                                        onClick={() => handleDelete(member)}
                                                        title="삭제"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <div className="modal-overlay" onClick={closeForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingId ? '회원 정보 수정' : '신규 회원 등록'}
                            </h3>
                            <button
                                className="schedule-list-close-btn"
                                type="button"
                                onClick={closeForm}
                            >
                                ×
                            </button>
                        </div>

                        <div className="member-info-form">
                            <label>이름</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="홍길동"
                            />

                            <label>학번</label>
                            <input
                                type="text"
                                value={form.student_id}
                                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                placeholder="2024xxxxx"
                            />

                            <label>전화번호</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="01012345678"
                            />

                            {!editingId && (
                                <p className="member-info-form-note">
                                    등록 시 초대코드가 자동으로 생성됩니다.
                                </p>
                            )}

                            <button className="apply-btn member-info-submit-btn" onClick={handleSubmitForm}>
                                {editingId ? '수정 완료' : '등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default MemberInfo;
