import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Nav';
import Footer from '../layout/Footer';
import { useNavigate } from 'react-router-dom';
import '../layout/common.css';
import '../styles/AdminPage.css';
import { getUserRole, isAuthError, redirectToLogin } from "../utils/token"
import { fetchMembers, fetchPosts, fetchExecutives, deletePost, updateUsersStatus, withdrawUsers } from '../api/adminAPI.js';
import Pagination from '../components/pagination.jsx';
import DangerZone from '../components/admin/danger_zone.jsx';
import ExecutiveZone from '../components/admin/excutive_zone.jsx';
import FinanceStats from '../components/admin/FinanceStats.jsx';
import { formatMaintenancePeriod } from "../utils/maintenanceFormat.js";

const ADMIN_POST_SORT_OPTIONS = [
    { value: "latest", label: "최신순" },
    { value: "views", label: "조회수 순" },
    { value: "likes", label: "좋아요 순" },
    { value: "comments", label: "댓글 순" },
];

const ADMIN_POST_SUB_CATEGORY_OPTIONS = {
    all: [
        "공지",
        "소모임",
        "게임",
        "기타",
        "공모전",
        "스터디",
        "초급반",
        "중급반",
        "심화반",
        "전필-수업자료/과제",
        "전필-족보",
        "전선-수업자료/과제",
        "전선-족보",
        "교양-수업자료/과제",
        "교양-족보",
        "개강총회",
        "종강총회",
        "MT",
        "행사",
        "점검일시",
        "점검내용",
    ],
    notice: ["공지"],
    free: ["소모임", "게임", "기타"],
    qna: [],
    recruit: ["공모전", "스터디", "소모임"],
    study: ["초급반", "중급반", "심화반"],
    project: [],
    contest: [],
    class: [
        "전필-수업자료/과제",
        "전필-족보",
        "전선-수업자료/과제",
        "전선-족보",
        "교양-수업자료/과제",
        "교양-족보",
    ],
    activity: ["개강총회", "종강총회", "MT", "행사"],
    maintenance: ["점검일시", "점검내용"],
};

const AdminPage = () => {
    const navigate = useNavigate();
    const [showFinance, setShowFinance] = useState(false);

    //전체 게시글
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //로딩 상태

    const [selectedPosts, setSelectedPosts] = useState([]);
    const [postCategory, setPostCategory] = useState('');
    const [postSubCategory, setPostSubCategory] = useState('all');
    const [postSort, setPostSort] = useState('latest');
    const [postSearch, setPostSearch] = useState('');

    // 부원 검색
    const [memberSearch, setMemberSearch] = useState('');

    //부원 목록
    const [availableMembers, setAvailableMembers] = useState([]);

    const [basketMembers, setBasketMembers] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isBasketOpen, setIsBasketOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const POSTS_PER_PAGE = 7;

    const role = getUserRole();
    const postSubCategoryOptions = ADMIN_POST_SUB_CATEGORY_OPTIONS[postCategory || "all"] || [];
    const hasPostSubCategoryOptions = postSubCategoryOptions.length > 0;

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
            const postsData = await fetchPosts(
                currentPage,
                POSTS_PER_PAGE,
                postCategory,
                postSearch,
                postSubCategory,
                postSort
            );
            setPosts(postsData.data || []);
            setTotalPages(postsData.pagination?.totalPages || 1);

            alert(`${selectedPosts.length}개의 게시글이 삭제되었습니다.`);
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
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
        if (basketMembers.length === 0) return alert('부원을 선택해주세요.');
        if (!selectedStatus) return alert('변경할 상태를 선택해주세요.');
        if (basketMembers.some(member => member.status === selectedStatus)) {
            return alert('동일한 상태로는 변경할 수 없습니다.');
        }
        const memberNames = basketMembers.map(member => member.name).join(', ');
        if (!window.confirm(`선택한 ${basketMembers.length}명(${memberNames})의 상태를 ${selectedStatus}(으)로 변경하시겠습니까?`)) {
            return;
        }

        try {
            const userIds = basketMembers.map(m => Number(m.id));
            await updateUsersStatus(userIds, selectedStatus);

            // 성공하면 로컬 state도 반영
            const updatedBasket = basketMembers.map(member => ({
                ...member,
                status: selectedStatus
            }));
            setAvailableMembers(prev => [...prev, ...updatedBasket]);

            // alert에 memberNames 넣어서 보여주기
            alert(`${basketMembers.length}명(${memberNames})의 상태를 '${selectedStatus}'(으)로 변경했습니다.`);
            setBasketMembers([]);
            setSelectedStatus('');
            setIsBasketOpen(false);
        } catch (error) {
            console.error('상태 변경 중 오류:', error);
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
            alert(error.response?.data?.message || '상태 변경에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleBatchDelete = async () => {
        if (basketMembers.length === 0) return alert('탈퇴시킬 부원을 담아주세요.');

        const hasPrivileged = basketMembers.some(m => m.role === 'OFFICER' || m.role === 'PRESIDENT');
        if (hasPrivileged) {
            return alert('임원 또는 회장은 탈퇴 처리할 수 없습니다. 먼저 해임 후 탈퇴 처리해주세요.');
        }
        // 이름 , 붙여서 나열
        const memberNames = basketMembers.map(member => member.name).join(', ');
        
        if (!window.confirm(`선택한 ${basketMembers.length}명(${memberNames})을 일괄 탈퇴 처리하시겠습니까?\n탈퇴 처리 후에는 복구할 수 없습니다.`)) {
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
            if (isAuthError(error)) {
                redirectToLogin(navigate, error);
                return;
            }
            alert('탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleResetBasket = () => {
        if (basketMembers.length === 0) return;
        if (window.confirm('선택한 부원을 모두 대기 목록으로 되돌리시겠습니까?')) {
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
                const postsData = await fetchPosts(
                    currentPage,
                    POSTS_PER_PAGE,
                    postCategory,
                    postSearch,
                    postSubCategory,
                    postSort
                );

                setAvailableMembers(membersData.data || []);
                setPosts(postsData.data || []);
                setTotalPages(postsData.pagination?.totalPages || 1);

            } catch (error) {
                console.error("데이터를 불러오는데 실패했습니다.", error);
                if (isAuthError(error)) {
                    redirectToLogin(navigate, error);
                    return;
                }
                alert("서버와 연결할 수 없습니다.");
            } finally {
                // 로딩 끝
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [currentPage, postCategory, postSubCategory, postSearch, postSort, navigate]); // 딱 한번 실행되도록 빈 배열을 넣음

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
        if (category === "activity") return "행사";
        return category;
    }

    function getPostTitlePrefix(post) {
        if (post.sub_category) return post.sub_category;

        return "";
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
                                        <div className="admin-post-filter-selects">
                                            <select
                                                className="form-control admin-board-category-select"
                                                value={postCategory}
                                                onChange={(e) => {
                                                    setPostCategory(e.target.value);
                                                    setPostSubCategory("all");
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value="">게시판 선택</option>
                                                <option value="notice">공지사항</option>
                                                <option value="free">자유</option>
                                                <option value="qna">질문</option>
                                                <option value="recruit">팀원 모집</option>
                                                <option value="study">스터디</option>
                                                <option value="project">과제/프로젝트</option>
                                                <option value="contest">대회/공모전</option>
                                                <option value="class">수업</option>
                                                <option value="activity">행사</option>
                                                <option value="maintenance">점검안내</option>
                                            </select>

                                            <select
                                                className="form-control admin-board-category-select admin-board-sub-category-select"
                                                value={hasPostSubCategoryOptions ? postSubCategory : ""}
                                                onChange={(e) => {
                                                    setPostSubCategory(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                disabled={!hasPostSubCategoryOptions}
                                            >
                                                {hasPostSubCategoryOptions ? (
                                                    <>
                                                        <option value="all">세부 말머리</option>
                                                        {postSubCategoryOptions.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <option value="">말머리 없음</option>
                                                )}
                                            </select>

                                            <select
                                                className="form-control admin-board-category-select admin-board-sort-select"
                                                value={postSort}
                                                onChange={(e) => {
                                                    setPostSort(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                {ADMIN_POST_SORT_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="admin-post-action-row">
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
                                    </div>

                                    <div className="admin-post-list">
                                        {posts.length === 0 ? (
                                            <p className="admin-post-empty">조건에 맞는 게시글이 없습니다.</p>
                                        ) : (
                                            <>
                                                <div className="admin-post-list-header" aria-hidden="true">
                                                    <span></span>
                                                    <span>분류</span>
                                                    <span>제목</span>
                                                    <span>작성자</span>
                                                    <span>날짜</span>
                                                    <span>조회</span>
                                                    <span>좋아요</span>
                                                    <span>댓글</span>
                                                </div>
                                                {posts.map(post => {
                                                    const isSelected = selectedPosts.includes(post.id);
                                                    const authorName = post.users?.name || "-";
                                                    const authorPrefix = post.users?.student_id?.slice(2, 4) || "";
                                                    const authorLabel = authorPrefix ? `${authorPrefix}${authorName}` : authorName;
                                                    const createdDate = post.created_at?.split('T')[0] || "-";
                                                    const titlePrefix = getPostTitlePrefix(post);
                                                    const maintenancePeriod = formatMaintenancePeriod(post);

                                                    return (
                                                        <div
                                                            key={post.id}
                                                            className={`admin-post-row ${isSelected ? "selected" : ""}`}
                                                            onClick={() => goToPostDetail(post.id)}
                                                        >
                                                            <label className="admin-post-check" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    aria-label={`${post.title || "게시글"} 선택`}
                                                                    checked={isSelected}
                                                                    onChange={() => togglePostSelect(post.id)}
                                                                />
                                                            </label>
                                                            <span className="admin-post-category">{getCategoryText(post.category)}</span>
                                                            <div className="admin-post-title-cell">
                                                                <h3>
                                                                    {titlePrefix && (
                                                                        <span className="admin-post-title-prefix">[{titlePrefix}]</span>
                                                                    )}
                                                                    {post.title || "-"}
                                                                    {maintenancePeriod && (
                                                                        <span className="maintenance-period-text">{maintenancePeriod}</span>
                                                                    )}
                                                                </h3>
                                                            </div>
                                                            <div className="admin-post-meta">
                                                                <span className="admin-post-author">{authorLabel}</span>
                                                                <span className="admin-post-date">{createdDate}</span>
                                                                <span className="admin-post-stat admin-post-stat-view">{post.view_count || 0}</span>
                                                                <span className="admin-post-stat admin-post-stat-like">{post._count?.post_likes || 0}</span>
                                                                <span className="admin-post-stat admin-post-stat-comment">{post._count?.comments || 0}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
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
                                    <button className="admin-search-btn" type="button">
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
                                                    <span className={`status-badge ${member.status === '졸업생' || member.status === '휴학생' ? 'gray' : 'mint'}`}>
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
