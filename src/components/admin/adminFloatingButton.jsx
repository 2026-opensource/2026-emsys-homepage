import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/token';
import '../../styles/adminFloatingButton.css';

const AdminFloatingButton = () => {
  const role = getUserRole();
  const navigate = useNavigate();

  if (role !== 'OFFICER' && role !== 'PRESIDENT') return null;

  return (
    <button
      className="admin-floating-btn"
      onClick={() => navigate('/admin-page')}
    >
      <i className="fa-solid fa-gears"></i>
      관리자
    </button>
  );
};

export default AdminFloatingButton;
