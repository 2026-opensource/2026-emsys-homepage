import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/token';
import '../../styles/adminFloatingButton.css';

const AdminFloatingButton = () => {
  const role = getUserRole();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (role !== 'OFFICER' && role !== 'PRESIDENT') return null;

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="admin-floating-wrapper" ref={wrapperRef}>
      {isOpen && (
        <div className="admin-floating-menu">
          <button
            className="admin-floating-menu-item"
            onClick={() => handleNavigate('/admin-page')}
          >
            <i className="fa-solid fa-table-columns"></i>
            관리자 페이지
          </button>
          <button
            className="admin-floating-menu-item"
            onClick={() => handleNavigate('/admin-page/memberInfo')}
          >
            <i className="fa-solid fa-user-plus"></i>
            부원정보 관리
          </button>
        </div>
      )}

      <button
        className={`admin-floating-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fa-solid fa-gears"></i>
        관리자
      </button>
    </div>
  );
};

export default AdminFloatingButton;