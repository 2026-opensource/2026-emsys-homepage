import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../api/postAPI";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/board.css";

function Community() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // 카테고리 key를 화면에 보여줄 한글로 변환
  function getCategoryText(category) {
    if (category === "notice") return "공지사항";
    if (category === "free") return "자유";
    if (category === "qna") return "질문";
    if (category === "recruit") return "팀원 모집";
    return category;
  }

  // 게시판 목록에서는 학번 이름
  function getUserDisplayName(user) {
    if (!user) return "알 수 없음";

    const studentYear = user.student_id?.slice(2, 4) || "";

    return `${studentYear} ${user.name}`;
  }

  // DB에서 커뮤니티 게시글 목록 가져오기
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPosts({
          board_type: "COMMUNITY",
          category,
          search,
          page: 1,
          limit: 10,
        });

        console.log("커뮤니티 게시글 목록 응답:", result);

        setPosts(result.data);
      } catch (error) {
        console.error("게시글 목록 조회 실패:", error);

        setErrorMessage(
          error.response?.data?.message ||
          "게시글 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, search]);

  return (
    <>
      <Navbar />

      {/* 메인 */}
      <div className="board-page-wrapper">
        <main className="board-page">
          <div className="board-container">
            {/* 제목 */}
            <div className="board-title-area">
              <h1 className="board-page-title">커뮤니티</h1>
              <div className="title-line"></div>
            </div>

            {/* 본문 */}
            <div className="board-main-area">
              {/* 글쓰기 */}
              <button
                type="button"
                className="write-btn"
                onClick={() => navigate("/community/write")}
              >
                글쓰기
              </button>

              {/* 검색 영역 */}
              <div className="board-search-area">
                <select
                  className="form-control board-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">전체 글</option>
                  <option value="free">자유</option>
                  <option value="qna">질문</option>
                  <option value="notice">공지사항</option>
                  <option value="recruit">팀원 모집</option>
                </select>

                <div className="input-group board-search-input">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <span className="input-group-btn">
                    <button
                      className="btn btn-default search-btn"
                      type="button"
                    >
                      <span className="glyphicon glyphicon-search"></span>
                    </button>
                  </span>
                </div>
              </div>

              {loading && <p className="board-message">게시글을 불러오는 중...</p>}

              {errorMessage && <p className="board-error">{errorMessage}</p>}

              {/* 게시글 리스트 */}
              {!loading && !errorMessage && (
                <section className="board-list">
                  {posts.length === 0 ? (
                    <p className="board-message">작성된 게시글이 없습니다.</p>
                  ) : (
                    posts.map((post) => (
                      <button
                        type="button"
                        className="board-link"
                        key={post.id}
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        <article className="board-card">
                          <div className="board-category">
                            {getCategoryText(post.category)}
                          </div>

                          <div className="board-main">
                            <h2 className="board-title">{post.title}</h2>

                            <p className="board-info">
                              {getUserDisplayName(post.users)} · {post.created_at?.slice(0, 10)}
                            </p>
                          </div>

                          <div className="board-stats">
                            <p>조회수 {post.view_count ?? 0}</p>
                            <p>좋아요 {post._count?.post_likes ?? 0}</p>
                            <p>댓글 {post._count?.comments ?? 0}</p>
                          </div>
                        </article>
                      </button>
                    ))
                  )}
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Community;