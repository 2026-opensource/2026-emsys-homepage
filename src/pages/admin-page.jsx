import React, { useState, useEffect } from 'react';
import '../styles/AdminPage.css';
import { fetchMembers, fetchPosts, fetchExecutives } from '../api/adminAPI.js';
import DangerZone from '../components/admin/danger_zone.jsx';
import ExecutiveZone from '../components/admin/excutive_zone.jsx';
import FinanceStats from '../components/admin/FinanceStats.jsx';

const AdminPage = () => {
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


    // 동작 실행 함수들
    const togglePostSelect = (postId) => {
        setSelectedPosts(prev =>
            prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
        );
    };

    const deletePosts = () => {
        if (selectedPosts.length === 0) {
            alert('삭제할 게시글을 하나 이상 선택해주세요.');
            return;
        }
        if (window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`)) {
            setPosts(prev => prev.filter(p => !selectedPosts.includes(p.id)));
            setSelectedPosts([]);
        }
    };

    const filteredPosts = posts.filter(p => {
        const matchCategory = !postCategory || p.category === postCategory;
        const matchSearch = !postSearch || p.title?.includes(postSearch) || p.users?.name?.includes(postSearch);
        return matchCategory && matchSearch;
    });

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

    const handleBatchUpdate = () => {
        if (basketMembers.length === 0) return alert('바구니에 회원을 먼저 담아주세요!');
        if (!selectedStatus) return alert('변경할 상태를 선택해주세요.');

        const updatedBasket = basketMembers.map(member => ({
            ...member,
            status: selectedStatus
        }));

        setAvailableMembers(prev => [...prev, ...updatedBasket]);

        alert(`바구니에 담긴 ${basketMembers.length}명의 상태를 '${selectedStatus}'(으)로 일괄 변경합니다!`);
        setBasketMembers([]);
        setSelectedStatus('');
        setIsBasketOpen(false);
    };

    const handleBatchDelete = () => {
        if (basketMembers.length === 0) return alert('바구니에 탈퇴시킬 회원을 담아주세요!');
        if (window.confirm(`정말 바구니에 있는 ${basketMembers.length}명을 일괄 탈퇴 처리하시겠습니까?`)) {
            alert('일괄 탈퇴가 완료되었습니다.');
            setBasketMembers([]);
            setSelectedStatus('');
            setIsBasketOpen(false);
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
                const postsData = await fetchPosts();

                setAvailableMembers(membersData.data || []);
                setPosts(postsData.data || []);

            } catch (error) {
                console.error("데이터를 불러오는데 실패했습니다.", error);
                alert("서버와 연결할 수 없습니다.");
            } finally {
                // 로딩 끝
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []); // 딱 한번 실행되도록 빈 배열을 넣음

    // 데이터를 가져오는 동안 보여줄 로딩 화면
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</div>;
    }


    return (
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
                                        onChange={(e) => setPostCategory(e.target.value)}
                                    >
                                        <option value="">카테고리</option>
                                        <option value="자유">자유</option>
                                        <option value="질문">질문</option>
                                        <option value="공지">공지</option>
                                    </select>

                                    <div className="input-group admin-board-search-input">
                                        <div className="modal-search-input-group">
                                            <input
                                                type="text"
                                                className="search-input"
                                                placeholder="게시글 검색"
                                                value={postSearch}
                                                onChange={(e) => setPostSearch(e.target.value)}
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
                                    {filteredPosts.length === 0 ? (
                                        <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>조건에 맞는 게시글이 없습니다.</p>
                                    ) : (
                                        filteredPosts.map(post => (
                                            <div key={post.id} className="post-item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPosts.includes(post.id)}
                                                    onChange={() => togglePostSelect(post.id)}
                                                />
                                                <div className="post-category">{post.category}</div>
                                                <div className="admin-post-content">
                                                    
                                                    <div className="post-text-group">
                                                        <h3>{post.title}</h3>
                                                        <p className="post-info"> {post.student_id?.slice(2, 4)}{post.users.name} · {post.created_at?.split('T')[0]}</p>
                                                    </div>

                                                    <div className="admin-post-stats">
                                                    <div>조회수 {post.view_count ||0}</div>
                                                    <div>좋아요 {post._count.post_likes || 0}</div>
                                                    <div>댓글 {post._count.comments || 0}</div>
                                                </div>
                                                </div>
                                                
                                            </div>
                                        ))
                                    )}
                                </div>
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
                                        <option value="재학">재학</option>
                                        <option value="휴학">휴학</option>
                                        <option value="졸업">졸업</option>
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

                        <button
                            className="drawer-toggle-btn"
                            onClick={() => setIsBasketOpen(!isBasketOpen)}
                        >
                            {isBasketOpen ? <i className="fa-solid fa-angle-left"></i> : <i className="fa-solid fa-angle-right"></i>}
                        </button>
                    </div>

                </div>
            </div>

            <div className="admin-bottom-grid">
                <div className="bottom-grid-left">
                    <ExecutiveZone />
                </div>
                <div className="bottom-grid-right">
                    <DangerZone />
                </div>
            </div>

        </div>
    );
};

export default AdminPage;