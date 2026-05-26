import React, { useState } from 'react';
import '../styles/AdminPage.css';
import DangerZone from '../components/admin/danger_zone.jsx'
import ExecutiveZone from '../components/admin/excutive_zone.jsx'
import FinanceStats from '../components/admin/FinanceStats.jsx';

const AdminPage = () => {
    const [showFinance, setShowFinance] = useState(false);

    const [posts, setPosts] = useState([
        { id: 1, category: '자유', title: '첫 번째 게시글 제목입니다', author: '홍길동', date: '2026-05-10', views: 12, likes: 7, comments: 3 },
        { id: 2, category: '공지', title: '동아리 정기 회의 공지', author: '김철수', date: '2026-05-15', views: 45, likes: 12, comments: 8 },
        { id: 3, category: '질문', title: '프로젝트 질문있습니다', author: '이영희', date: '2026-05-18', views: 23, likes: 5, comments: 15 },
        { id: 4, category: '질문', title: '프로젝트 질문있습니다', author: '이영희', date: '2026-05-18', views: 23, likes: 5, comments: 15 },
        { id: 5, category: '질문', title: '프로젝트 질문있습니다', author: '이영희', date: '2026-05-18', views: 23, likes: 5, comments: 15 },
    ]);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [postCategory, setPostCategory] = useState('');
    const [postSearch, setPostSearch] = useState('');

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
        const matchSearch = !postSearch || p.title.includes(postSearch) || p.author.includes(postSearch);
        return matchCategory && matchSearch;
    });

    const [availableMembers, setAvailableMembers] = useState([
        { id: 1, name: '금동이', status: '재학' },
        { id: 2, name: '은동이', status: '휴학' },
        { id: 3, name: '동동이', status: '재학' },
        { id: 4, name: '청동이', status: '졸업' },
    ]);
    const [basketMembers, setBasketMembers] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isBasketOpen, setIsBasketOpen] = useState(false);

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

    return (
        <div className="admin-page">
            <div className="admin-main">
                <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                    <div className="left-section admin-box">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="box-title">{showFinance ? '회계 지출 통계' : '게시글 관리'}</h2>
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
                                <div className="post-controls-row">
                                    <select
                                        className="form-control board-category-select"
                                        value={postCategory}
                                        onChange={(e) => setPostCategory(e.target.value)}
                                    >
                                        <option value="">카테고리</option>
                                        <option value="자유">자유</option>
                                        <option value="질문">질문</option>
                                        <option value="공지">공지</option>
                                    </select>

                                    <div className="input-group board-search-input">
                                        <div className="modal-search-input-group">
                                            <input
                                                type="text"
                                                className="search-input"
                                                placeholder="게시글 검색"
                                            />
                                            <button className="search-btn" type="button">
                                                <i className="fa-solid fa-magnifying-glass"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <button className="btn-danger" onClick={deletePosts}>
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
                                                <div className="post-content">
                                                    <div className="post-category">{post.category}</div>

                                                    <div className="post-text-group">
                                                        <h3>{post.title}</h3>
                                                        <p className="post-info">{post.author} · {post.date}</p>
                                                    </div>
                                                </div>
                                                <div className="post-stats">
                                                    <div>조회수 {post.views}</div>
                                                    <div>좋아요 {post.likes}</div>
                                                    <div>댓글 {post.comments}</div>
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
                                <div className="section-header">
                                    <h2 className="box-title">부원 목록</h2>
                                </div>
                            </div>

                            <div className="modal-search-input-group">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="부원 이름 검색..."
                                />
                                <button className="search-btn" type="button">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>

                            <div className="user-box-content">
                                <div className="available-members-view">
                                    <ul className="member-ul">
                                        {availableMembers.length === 0 && <p className="empty-text">대기 중인 회원이 없습니다.</p>}
                                        {availableMembers.map(member => (
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
                                    <button onClick={handleBatchUpdate} className="apply-btn">적용</button>
                                    <button onClick={handleBatchDelete} className="delete-btn">탈퇴</button>
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