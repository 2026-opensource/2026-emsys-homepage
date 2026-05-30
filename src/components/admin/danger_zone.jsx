import React, { useState, useEffect } from 'react';
import { fetchMembers, delegateMaster } from '../../api/adminAPI.js';
import { AlertTriangle, X } from 'lucide-react';

const DangerZone = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 검색을 위한 전체 부원 목록
  const [allMembers, setAllmembers] = useState([]);

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleCancelSelection = () => {
    setSelectedMember(null);
  };

  // 권한 위임
  const handleTransferAuthority = async () => {
    if (!selectedMember) {
      return alert('권한을 위임할 부원을 선택해 주세요.');
    }

    const expectedText =
    `${selectedMember.name}을 회장으로 임명`;

    const inputText = prompt(
    `정말 권한을 위임하려면\n"${expectedText}"\n를 정확히 입력하세요.`
    );

    if (inputText !== expectedText) {
      return alert('문구가 정확하지 않습니다.');
    }

    try {
      const result = await delegateMaster(selectedMember.id, inputText);

      alert(result.message);

      setSelectedMember(null);
      setSearchTerm('');

    } catch (error) {
      alert(
        error.response?.data?.message ||
        '권한 위임 실패'
      );
    }
  };

  // 백엔드 데이터 (부원 전체) 불러오기
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const membersData = await fetchMembers();
        setAllmembers(membersData.data || []);
      }
      catch (error) {
        console.error("데이터를 불러오는데 실패했습니다", error);
        alert("서버와 연결할 수 없습니다.");
      }
    };

    loadInitialData();
  }, []); // 처음 한번만 실행되게 빈 배열 넣기

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
                  placeholder={selectedMember ? "위임 대상이 선택되었습니다." : "부원 이름 검색..."}
                  value={searchTerm}
                  disabled={!!selectedMember}
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

              {isDropdownOpen && searchTerm && !selectedMember && (
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

              {selectedMember && (
                <div className="selected-admin-badge">
                  <div className="badge-info">
                    <span className="badge-name">{selectedMember.name}</span>
                    <span className="badge-role">{selectedMember.role}</span>
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