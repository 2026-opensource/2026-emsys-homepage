import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/pagination";
import "../layout/common.css";
import "../styles/mypage.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyInfo, updateProfileImage, resetProfileImage } from "../api/userAPI";
import { getMyPosts } from "../api/postAPI";
import { isAuthError, redirectToLogin, requireLogin } from "../utils/token";
import defaultProfile from "../assets/images/기본_프로필.png";

function MyPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [myPosts, setMyPosts] = useState([]);
  const [myPostsPage, setMyPostsPage] = useState(1);
  const [myPostsTotalPages, setMyPostsTotalPages] = useState(1);
  const MY_POSTS_PER_PAGE = 5;

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

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

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

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(
        error.response?.data?.message ||
        "기본 프로필 이미지로 변경하지 못했습니다."
      );
    }
  }

  useEffect(() => {
    async function fetchMyInfo() {
      if (!requireLogin(navigate)) return;

      try {
        const result = await getMyInfo();

        console.log("마이페이지 사용자 정보:", result);

        setUser(result.data);
      } catch (error) {
        console.error("마이페이지 정보 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
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

  useEffect(() => {
    async function fetchMyPosts() {
      if (!requireLogin(navigate)) return;

      try {
        const result = await getMyPosts({ page: myPostsPage, limit: MY_POSTS_PER_PAGE });
        setMyPosts(result.data);
        setMyPostsTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("내 게시글 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
        }
      }
    }
    fetchMyPosts();
  }, [myPostsPage, navigate]);

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
    if (role === "OFFICER") return "임원";
    return "부원";
  }

  const profileImageUrl = user?.profile_image
    ? `${import.meta.env.VITE_API_BASE_URL}${user.profile_image}`
    : defaultProfile;

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

  function formatPhoneNumber(phoneNumber) {
    const numbers = String(phoneNumber || "").replace(/\D/g, "");

    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }

    return phoneNumber || "";
  }

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
                  <div className="user-info-label">학번</div>
                  <div className="user-info-value">{user?.student_id}</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">이름</div>
                  <div className="user-info-value">{user?.name}</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">등급</div>
                  <div className="user-info-value">{getRoleText(user?.role)}</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">전화번호</div>
                  <div className="user-info-value">{formatPhoneNumber(user?.phone_number)}</div>
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
            <a className="community-link" href="mypage-board-link">
              +
            </a>
          </div>

          <hr className="header-divider" />

          <div className="section-box">
            <div className="mypage-board-list">
              {myPosts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888' }}>작성한 게시글이 없습니다.</p>
              ) : (
                myPosts.map((post) => (
                  <a key={post.id} href={`/posts/${post.id}`} className="board-link">
                    <article className="mypage-board-card">
                      <div className="mypage-board-row">
                        <div className="mypage-board-category">{getCategoryText(post.category)}</div>
                        <div className="mypage-board-main">
                          <h2 className="mypage-board-title">{post.title}</h2>
                          <p className="mypage-board-info">{post.users?.name} · {post.created_at?.slice(0, 10)}</p>
                        </div>
                        <div className="mypage-board-stats">
                          <p>조회수 {post.view_count ?? 0}</p>
                          <p>좋아요 {post._count?.post_likes ?? 0}</p>
                          <p>댓글 {post._count?.comments ?? 0}</p>
                        </div>
                      </div>
                    </article>
                  </a>
                ))
              )}
            </div>
            <Pagination
              currentPage={myPostsPage}
              totalPages={myPostsTotalPages}
              onPageChange={setMyPostsPage}
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default MyPage;
