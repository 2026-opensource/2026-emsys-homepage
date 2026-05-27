import React, { useState } from 'react';
import '../../styles/masterSection.css';

const ExecutiveTeamRoster = () => {
  
  // 임원 상태
  const [executives, setExecutives] = useState([
    { id: 101, name: '25 탁우림', role: '부회장', image: '{{DATA:IMAGE:IMAGE_1}}' },
    { id: 102, name: '24 이나연', role: '학습부장', image: '{{DATA:IMAGE:IMAGE_2}}' }
  ]);

  //  모달 및 검색창 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 3. [가상 데이터] 전체 부원 목록
  const [allMembers] = useState([
    { id: 1, name: '23 황금독수리 하늘을 날다', role: '소프트웨어학과 '},
    { id: 2, name: '22 칼빔면에 육회 한사바리 와르르찹찹', role: '소프트웨어학과 '},
    { id: 3, name: '21 박서준', role: '소프트웨어학과 '},
    { id: 101, name: 'Dr. Elias Vance', role: '교수 위원', image: '{{DATA:IMAGE:IMAGE_1}}' }
  ]);

  // 해임 기능
  const handleDismiss = (id) => {
    if (window.confirm('해당 임원을 해임하시겠습니까?')) {
      setExecutives(executives.filter(exec => exec.id !== id));
    }
  };

  // 임원 새 임명 실행 기능
  const handleAppoint = (member) => {
    if (executives.some(exec => exec.id === member.id)) return;

    const customRole = prompt(`[${member.name}] 님의 직책 :`, "Executive Member");
    if (customRole === null) return;

    setExecutives([
      ...executives,
      {
        id: member.id,
        name: member.name,
        role: customRole || 'Executive Member',
        image: member.image
      }
    ]);

    setIsModalOpen(false);
    setSearchTerm('');
  };

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-box executive-roster">
      <div className="section-header">
        <h2 className="box-title">
          <i class="fa-regular fa-address-card"></i> 임원 임명
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
          <i class="fa-solid fa-user-plus"></i>
          <span>임원 추가</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">새 임원 임명</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <i class="fa-solid fa-xmark"></i>
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