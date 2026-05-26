import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DangerZone = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [allMembers] = useState([
    { id: 1, name: '문서연', role: '' },
    { id: 2, name: '김은솔', role: '' },
    { id: 3, name: '최희원', role: '' },
    { id: 4, name: '탁우림', role: '부회장' },
    { id: 5, name: '이나연', role: '학습부장인가' }
  ]);

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMember = (member) => {
    setSelectedAdmin(member);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleCancelSelection = () => {
    setSelectedAdmin(null);
  };

  const handleTransferAuthority = () => {
    if (!selectedAdmin) return alert('권한을 위임할 부원을 목록에서 선택해 주세요.');
    if (window.confirm(`정말로 모든 마스터 권한을 [${selectedAdmin.name}]님에게 위임하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      alert(`${selectedAdmin.name}님에게 권한 위임이 완료되었습니다. 일반 회원으로 전환됩니다.`);
      setSelectedAdmin(null);
      setSearchTerm('');
    }
  };

  return (
    <div className="danger-zone-container">
      <div className="danger-zone-header">
        <AlertTriangle />
        <h2 className="danger-zone-title">회장 권한 위임</h2>
      </div>

      <div>
        <div className="danger-actions">
          <div className="authority-delegation">
            <h4>회장 권한을 임명할 사람을 찾으세요</h4>

            <div className="delegation-search-wrapper">
              <div className="delegation-input-row">
                <input
                  type="text"
                  placeholder={selectedAdmin ? "위임 대상이 선택되었습니다." : "부원 이름 검색..."}
                  value={searchTerm}
                  disabled={!!selectedAdmin}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="delegation-input"
                />
                <button
                  onClick={handleTransferAuthority}
                  className="delegation-btn"
                >
                  임명
                </button>
              </div>

              {isDropdownOpen && searchTerm && !selectedAdmin && (
                <div className="delegation-dropdown">
                  {filteredMembers.length === 0 ? (
                    <div className="dropdown-empty">
                      검색 결과가 없습니다.
                    </div>
                  ) : (
                    filteredMembers.map(member => (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="dropdown-item"
                      >
                        <span className="dropdown-item-name">{member.name}</span>
                        <span className="dropdown-item-role">{member.role}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedAdmin && (
                <div className="selected-admin-badge">
                  <div className="badge-info">
                    <span className="badge-name">{selectedAdmin.name}</span>
                    <span className="badge-role">{selectedAdmin.role}</span>
                  </div>
                  <button onClick={handleCancelSelection} className="badge-remove-btn">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="danger-zone-footer">
            <div>
              <p className="danger-description">
                홈페이지 관리 권한을 이양합니다.<br />
                권한 위임이 완료되는 즉시 현재 계정의 마스터 권한은 회수되며, <br />
                일반 회원 등급으로 자동 변경됩니다. <strong>작업은 되돌릴 수 없습니다.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;