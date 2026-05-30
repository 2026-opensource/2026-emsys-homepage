import React, { useState, useEffect } from 'react';
import { fetchMembers, fetchExecutives, appointExecutive, dismissExecutive } from '../../api/adminAPI.js';
import '../../styles/masterSection.css';

const ExecutiveTeamRoster = () => {

  // 임원 상태
  const [executives, setExecutives] = useState([]);

  //  모달 및 검색창 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 임원 등록을 위한 전체 부원 목록
  const [allMembers, setAllMembers] = useState([]);

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 부원 불러오기
  const loadExecutives = async () => {
    try {
      const result = await fetchExecutives();
      setExecutives(result.data);
    }

    catch (error) {
      console.error(error);
    }
  };

  // 해임 기능
  const handleDismiss = async (id) => {
    if (!window.confirm('해당 임원을 해임하시겠습니까?')) {
      return;
    }

    try {
      await dismissExecutive(id);
      await loadExecutives();
    }

    catch (error) {
      console.error(error);
      alert('임원 해임 오류. 해임 실패');
    }
  };

  // 임원 새 임명 실행 기능
  const handleAppoint = async (member) => {

    if (executives.some(exec => exec.id === member.id)) {
      return;
    }

    const customRole = prompt(
      `[${member.name}] 님의 직책 :`,
      "학습부장"
    );

    if (customRole === null) {
      return;
    }

    try {
      await appointExecutive(
        member.id,
        customRole
      );
      await loadExecutives();
      setIsModalOpen(false);
      setSearchTerm('');
    }

    catch (error) {
      console.error(error);
      alert('임원 임명 실패');

    }
  };

  // 백엔드에서 데이터 불러오기
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const executiveData = await fetchExecutives();
        const membersData = await fetchMembers();

        setExecutives(executiveData.data || []);
        setAllMembers(membersData.data || []);

      }
      catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
        alert("서버와 연결할 수 없습니다.");
      }
    };

    loadInitialData();
  }, []); // 딱 한번 실행되도록 빈 배열을 넣음


  return (
    <div className="admin-box executive-roster">
      <div className="admin-section-header">
        <h2 className="admin-box-title">
          <i className="fa-regular fa-address-card"></i> 임원 임명
        </h2>
      </div>

      <div className="executive-grid">
        {executives.map(exec => (
          <div key={exec.id} className="executive-card">
            <div className="executive-info">
              <h4 className="executive-name">{exec.name}</h4>
              <p className="executive-role">{exec.role}</p>
            </div>
            <button
              onClick={() => handleDismiss(exec.id)}
              className="btn-danger"
            >
              해임
            </button>
          </div>
        ))}

        <button className="appoint-new-btn" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-user-plus"></i>
          <span>임원 추가</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">새 임원 임명</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-search-row">
              <div className="modal-search-input-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder="부원 이름 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button className="search-btn" type="button">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>

            <div className="modal-member-list">
              {filteredMembers.length === 0 ? (
                <p className="empty-text" style={{ padding: '20px 0', marginTop: 0 }}>검색 결과와 일치하는 부원이 없습니다.</p>
              ) : (
                filteredMembers.map(member => {
                  const isAlreadyExec = executives.some(exec => exec.id === member.id);
                  return (
                    <div
                      key={member.id}
                      className={`modal-member-item ${isAlreadyExec ? 'disabled' : ''}`}
                      onClick={() => !isAlreadyExec && handleAppoint(member)}
                    >
                      <div className="modal-member-info">
                        <div>
                          <p className="modal-member-name">{member.name}</p>
                          <p className="modal-member-role">{member.role}</p>
                        </div>
                      </div>
                      {isAlreadyExec && (
                        <span className="status-badge gray" style={{ fontSize: '11px', padding: '2px 8px' }}>이미 임원</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveTeamRoster;