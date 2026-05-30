import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/mypage.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyInfo, updateProfileImage, resetProfileImage } from "../api/userAPI";
import { removeToken } from "../utils/token";
import defaultProfile from "../assets/images/기본_프로필.png";

function MyPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleProfileImageChange(e) {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      alert("이미지 파일은 5MB 이하만 업로드할 수 있습니다.");
      return;
    }

    try {
      const result = await updateProfileImage(file);

      console.log("프로필 이미지 변경 응답:", result);

      setUser({
        ...user,
        profile_image: result.data.profile_image,
      });

      alert("프로필 이미지가 변경되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 변경 실패:", error);

      alert(
        error.response?.data?.message ||
        "프로필 이미지 변경에 실패했습니다."
      );
    }
  }

  async function handleResetProfileImage() {
    if (!user?.profile_image) {
      alert("이미 기본 프로필 이미지입니다.");
      return;
    }

    const confirmReset = window.confirm("기본 프로필 이미지로 변경하시겠습니까?");

    if (!confirmReset) {
      return;
    }

    try {
      const result = await resetProfileImage();

      console.log("기본 프로필 변경 응답:", result);

      setUser({
        ...user,
        profile_image: null,
      });

      alert("기본 프로필 이미지로 변경되었습니다.");
    } catch (error) {
      console.error("기본 프로필 변경 실패:", error);

      alert(
        error.response?.data?.message ||
        "기본 프로필 이미지로 변경하지 못했습니다."
      );
    }
  }

  useEffect(() => {
    async function fetchMyInfo() {
      try {
        const result = await getMyInfo();

        console.log("마이페이지 사용자 정보:", result);

        setUser(result.data);
      } catch (error) {
        console.error("마이페이지 정보 조회 실패:", error);

        if (error.response?.status === 401) {
          removeToken();
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
          "사용자 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMyInfo();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mypage-container">
          <p className="mypage-loading">사용자 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Navbar />
        <div className="mypage-container">
          <p className="mypage-error">{errorMessage}</p>
        </div>
        <Footer />
      </>
    );
  }

  function getRoleText(role) {
    if (role === "PRESIDENT") return "회장";
    if (role === "ADMIN") return "임원";
    return "부원";
  }

  const profileImageUrl = user?.profile_image
    ? `${import.meta.env.VITE_API_BASE_URL}${user.profile_image}`
    : defaultProfile;

  return (
    <>
      <Navbar />
      <div className="mypage-container">
        <h1 className="mypage-text">마이페이지</h1>

        {/* 사용자 정보 */}
        <div className="user-info-box">
          <h2 className="section-title">사용자 정보</h2>
          <hr className="header-divider" />

          <div className="user-info-body">
            <section className="profile-image-section">
              <label className="profile-image-change-label">
                <img
                  className="profile-image"
                  src={profileImageUrl}
                  alt="프로필 이미지"
                />

                <span className="profile-image-overlay">
                  사진 변경
                </span>

                <input
                  className="profile-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </label>

              <div className="profile-reset-area">
                <button
                  type="button"
                  className="profile-reset-btn"
                  onClick={handleResetProfileImage}
                >
                  기본 프로필로 변경
                </button>
              </div>
            </section>

            <section className="user-info-content1">
              <div className="user-info-inner-box">
                <div className="user-info-row">
                  <div className="user-info-label">사용자 이름</div>
                  <div className="user-info-value">{user?.name}</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">아이디(이메일)</div>
                  <div className="user-info-value">{user?.email}</div>
                </div>


                <div className="user-info-row">
                  <div className="user-info-label">학번</div>
                  <div className="user-info-value">{user?.student_id}</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">등급</div>
                  <div className="user-info-value">{getRoleText(user?.role)}</div>
                </div>
              </div>
            </section>

            <section className="user-info-content2">
              <div className="user-history-box">
                <p className="user-history">방문 : {user?.visit_count ?? 0} 회</p>
                <p className="user-history">작성한 글 : {user?.post_count ?? 0} 개</p>
                <p className="user-history">작성한 댓글 : {user?.comment_count ?? 0} 개</p>
                <p className="user-history">내가 좋아요한 글 : {user?.liked_post_count ?? 0} 개</p>
              </div>
            </section>
          </div>
        </div>

        {/* 내가 작성한 글 */}
        <section className="my-posts-box">
          <div className="posts-header">
            <h2 className="section-title">내가 작성한 글</h2>
            <a className="community-link" href="board-link">
              +
            </a>
          </div>

          <hr className="header-divider" />

          <div className="section-box">
            <div className="board-list">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <a key={item} href="./posts.html" className="board-link">
                  <article className="board-card">
                    <div className="board-row">
                      <div className="board-category">자유</div>

                      <div className="board-main">
                        <h2 className="board-title">
                          첫 번째 게시글 제목입니다
                        </h2>
                        <p className="board-info">홍길동 · 2026-05-10</p>
                      </div>

                      <div className="board-stats">
                        <p>조회수 12</p>
                        <p>좋아요 7</p>
                        <p>댓글 3</p>
                      </div>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default MyPage;
