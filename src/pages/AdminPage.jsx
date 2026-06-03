import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Nav';
import Footer from '../layout/Footer';
import { useNavigate } from 'react-router-dom';
import '../layout/common.css';
import '../styles/adminPage.css';
import { getUserRole } from "../utils/token"
import { fetchMembers, fetchPosts, fetchExecutives, deletePost, updateUsersStatus, withdrawUsers } from '../api/adminAPI.js';
import Pagination from '../components/Pagination.jsx';
import DangerZone from '../components/admin/danger_zone.jsx';
import ExecutiveZone from '../components/admin/excutive_zone.jsx';
import FinanceStats from '../components/admin/FinanceStats.jsx';

const AdminPage = () => {
    const navigate = useNavigate();
    const [showFinance, setShowFinance] = useState(false);

    //전체 게시글
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //로딩 상태

    const [selectedPosts, setSelectedPosts] = useState([]);
    const [postCategory, setPostCategory] = useState('');
    const [postSearch, setPostSearch] = useState('');

    // 부원 검색
    const [memberSearch, setMemberSearch] = useState('');

    const [availableMembers, setAvailableMembers] = useState([]);//부원 목록

    const [basketMembers, setBasketMembers] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isBasketOpen, setIsBasketOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const POSTS_PER_PAGE = 5;

    const role = getUserRole();

    // 동작 실행 함수들
    const togglePostSelect = (postId) => {
        setSelectedPosts(prev =>
            prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
        );
    };

    const deletePosts = async () => {
        if (selectedPosts.length === 0) {
            alert('삭제할 게시글을 하나 이상 선택해주세요.');
            return;
        }
        if (!window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // 선택된 게시글 전부 순서대로 삭제 요청
            await Promise.all(selectedPosts.map(postId => deletePost(postId)));
            setSelectedPosts([]);

            // 삭제 후 데이터 새로 불러오기
            const postsData = await fetchPosts(currentPage, POSTS_PER_PAGE, postCategory, postSearch);
            setPosts(postsData.data || []);
            setTotalPages(postsData.pagination?.totalPages || 1);

            alert(`${selectedPosts.length}개의 게시글이 삭제되었습니다.`);
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            alert('일부 게시글 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 게시글 상세보기로 이동
    const goToPostDetail = (postId) => {
        navigate(`/posts/${postId}`);
    };

    const filteredMembers = availableMembers.filter(m =>
        !memberSearch || m.name.includes(memberSearch)
    );

    const moveToBasket = (member) => {
        setAvailableMembers(availableMembers.filter(m => m.id !== member.id));
        setBasketMembers([...basketMembers, member]);
        setIsBasketOpen(true);
    };

    const moveToList = (member) => {
        setBasketMembers(basketMembers.filter(m => m.id !== member.id));
        setAvailableMembers([...availableMembers, member]);
    };

    const handleBatchUpdate = async () => {
        if (basketMembers.length === 0) return alert('바구니에 회원을 먼저 담아주세요!');
        if (!selectedStatus) return alert('변경할 상태를 선택해주세요.');

        try {
            const userIds = basketMembers.map(m => Number(m.id));
            await updateUsersStatus(userIds, selectedStatus);

            // 성공하면 로컬 state도 반영
            const updatedBasket = basketMembers.map(member => ({
                ...member,
                status: selectedStatus
            }));
            setAvailableMembers(prev => [...prev, ...updatedBasket]);

            alert(`${basketMembers.length}명의 상태를 '${selectedStatus}'(으)로 변경했습니다.`);
            setBasketMembers([]);
            setSelectedStatus('');
            setIsBasketOpen(false);
        } catch (error) {
            console.error('상태 변경 중 오류:', error);
            alert('상태 변경에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleBatchDelete = async () => {
        if (basketMembers.length === 0) return alert('바구니에 탈퇴시킬 회원을 담아주세요!');

        const hasPrivileged = basketMembers.some(m => m.role === 'OFFICER' || m.role === 'PRESIDENT');
        if (hasPrivileged) {
            return alert('임원 또는 회장은 탈퇴 처리할 수 없습니다. 먼저 해임 후 탈퇴 처리해주세요.');
        }

        if (!window.confirm(`정말 바구니에 있는 ${basketMembers.length}명을 일괄 탈퇴 처리하시겠습니까?`)) {
            return;
        }

        try {
            const userIds = basketMembers.map(m => Number(m.id));
            const reason = prompt('탈퇴 사유를 입력하세요.');
            if (reason === null) return;
            await withdrawUsers(userIds, reason);

            setAvailableMembers(prev => prev.filter(m => !userIds.includes(m.id)));
            setBasketMembers([]);
            setSelectedStatus('');
            setIsBasketOpen(false);
            alert('일괄 탈퇴가 완료되었습니다.');
        } catch (error) {
            console.error('탈퇴 처리 오류:', error);
            alert('탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleResetBasket = () => {
        if (basketMembers.length === 0) return;
        if (window.confirm('바구니를 비우고 모든 회원을 대기 목록으로 되돌리시겠습니까?')) {
            setAvailableMembers([...availableMembers, ...basketMembers]);
            setBasketMembers([]);
            setSelectedStatus('');
            setIsBasketOpen(false);
        }
    };

    // 백엔드에서 데이터 불러오기
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 로딩 시작
                setIsLoading(true);

                // 백엔드에서 데이터 가져오기 (비동기 처리)
                const membersData = await fetchMembers();
                const postsData = await fetchPosts(currentPage, POSTS_PER_PAGE, postCategory, postSearch);

                setAvailableMembers(membersData.data || []);
                setPosts(postsData.data || []);
                setTotalPages(postsData.pagination?.totalPages || 1);

            } catch (error) {
                console.error("데이터를 불러오는데 실패했습니다.", error);
                alert("서버와 연결할 수 없습니다.");
            } finally {
                // 로딩 끝
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [currentPage, postCategory, postSearch]); // 딱 한번 실행되도록 빈 배열을 넣음

    // 카테고리 key를 화면에 보여줄 한글로 변환
    function getCategoryText(category) {
        if (category === "notice") return "공지사항";
        if (category === "free") return "자유";
        if (category === "qna") return "질문";
        if (category === "recruit") return "팀원 모집";
        if (category === "study") return "스터디";
        if (category === "project") return "과제/프로젝트";
        if (category === "contest") return "대회/공모전";
        if (category === "class") return "수업";
        if (category === "event") return "행사";
        return category;
    }

    // 데이터를 가져오는 동안의 로딩 화면
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</div>;
    }


    return (
        <>
            <Navbar />
            <div className="admin-page">
                <div className="admin-main">
                    <div className="admin-grid">

                        <div className="left-section admin-box">
                            <div className="admin-section-header" >
                                <h2 className="admin-box-title">{showFinance ? '회계 지출 통계' : '게시글 관리'}</h2>
                                <button
                                    className="status-badge mint"
                                    style={{ border: 'none', cursor: 'pointer', padding: '5px 10px' }}
                                    onClick={() => setShowFinance(!showFinance)}
                                >
                                    {showFinance ? '게시글 관리 보기' : '회계 통계 보기'}
                                </button>
                            </div>

                            {showFinance ? (
                                <FinanceStats />
                            ) : (
                                <>
                                    <div className="admin-post-controls-row">
                                        <select
                                            className="form-control admin-board-category-select"
                                            value={postCategory}
                                            onChange={(e) => { setPostCategory(e.target.value); setCurrentPage(1); }}
                                        >
                                            <option value="">전체</option>
                                            <option value="notice">공지사항</option>
                                            <option value="free">자유</option>
                                            <option value="qna">질문</option>
                                            <option value="recurit">팀원 모집</option>
                                            <option value="study">스터디</option>
                                            <option value="project">과제/프로젝트</option>
                                            <option value="contest">대회/공모전</option>
                                            <option value="class">수업</option>
                                            <option value="event">행사</option>
                                        </select>

                                        <div className="input-group admin-board-search-input">
                                            <div className="modal-search-input-group">
                                                <input
                                                    type="text"
                                                    className="search-input"
                                                    placeholder="게시글 검색"
                                                    value={postSearch}
                                                    onChange={(e) => { setPostSearch(e.target.value); setCurrentPage(1); }}
                                                />
                                                <button className="admin-search-btn" type="button">
                                                    <i className="fa-solid fa-magnifying-glass"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <button className="btn-danger btn-delete" onClick={deletePosts}>
                                            선택 삭제
                                        </button>
                                    </div>

                                    <div className="post-list">
                                        {posts.length === 0 ? (
                                            <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>조건에 맞는 게시글이 없습니다.</p>
                                        ) : (
                                            posts.map(post => (
                                                <div key={post.id} className="post-item" onClick={() => goToPostDetail(post.id)} style={{ cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={() => togglePostSelect(post.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="post-category">{getCategoryText(post.category)}</div>
                                                    <div className="admin-post-content">

                                                        <div className="post-text-group">
                                                            <h3>
                                                                {post.title}
                                                            </h3>
                                                            <p className="post-info"> {post.users.student_id?.slice(2, 4)}{post.users.name} · {post.created_at?.split('T')[0]}</p>
                                                        </div>

                                                        <div className="admin-post-stats">
                                                            <div>조회수 {post.view_count || 0}</div>
                                                            <div>좋아요 {post._count.post_likes || 0}</div>
                                                            <div>댓글 {post._count.comments || 0}</div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </>
                            )}
                        </div>

                        <div className={`right-section-wrapper ${isBasketOpen ? 'open' : ''}`}>

                            <div className="admin-box user-transfer-box">
                                <div className="user-box-header">
                                    <div className="admin-section-header">
                                        <h2 className="admin-box-title">부원 목록</h2>
                                    </div>
                                </div>

                                <div className="modal-search-input-group">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="부원 이름 검색..."
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                    />
                                    <button className="search-btn" type="button">
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                </div>

                                <div className="user-box-content">
                                    <div className="available-members-view">
                                        <ul className="member-ul">
                                            {availableMembers.length === 0 && <p className="empty-text">대기 중인 회원이 없습니다.</p>}
                                            {filteredMembers.map(member => (
                                                <li key={member.id} onDoubleClick={() => moveToBasket(member)} className="member-item">
                                                    <span>{member.name}</span>
                                                    <span className={`status-badge ${member.status === '졸업' ? 'gray' : 'mint'}`}>
                                                        {member.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="drawer-toggle-btn"
                                onClick={() => setIsBasketOpen(!isBasketOpen)}
                            >
                                {isBasketOpen ? <i className="fa-solid fa-angle-left"></i> : <i className="fa-solid fa-angle-right"></i>}
                            </button>
                            <div className="admin-box basket-drawer-box">
                                <div className="user-box-header">
                                    <div className="basket-section-header">
                                        <h2 className="basket-title">
                                            선택된 부원
                                        </h2>
                                        {basketMembers.length > 0 && (
                                            <button className="reset-basket-btn" onClick={handleResetBasket} title="비우기">
                                                <i className="fa-solid fa-arrow-rotate-left"></i>
                                            </button>
                                        )}
                                    </div>

                                    <div className="user-controls-row">
                                        <select className="status-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                            <option value="">상태 선택</option>
                                            <option value="재학생">재학</option>
                                            <option value="휴학생">휴학</option>
                                            <option value="졸업생">졸업</option>
                                        </select>
                                        <button onClick={handleBatchUpdate} className="btn-apply">적용</button>
                                        <button onClick={handleBatchDelete} className="btn-delete">탈퇴</button>
                                    </div>
                                </div>

                                <div className="user-box-content">
                                    <div className="basket-members-view">
                                        <ul className="member-ul">
                                            {basketMembers.length === 0 && <p className="empty-text">더블클릭하여 담기</p>}
                                            {basketMembers.map(member => (
                                                <li key={member.id} onDoubleClick={() => moveToList(member)} className="member-item">
                                                    <span>{member.name} <span>({member.status})</span></span>
                                                    <button onClick={() => moveToList(member)} className="remove-btn">✕</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {role === 'PRESIDENT' && (
                    <div className="admin-bottom-grid">
                        <div className="bottom-grid-left">
                            <ExecutiveZone />
                        </div>
                        <div className="bottom-grid-right">
                            <DangerZone />
                        </div>
                    </div>
                )}

            </div>
            <Footer />
        </>
    );
};

export default AdminPage;
