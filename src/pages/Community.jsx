import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPosts } from "../api/postAPI";


import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/Pagination";

import "../layout/common.css";
import "../styles/board.css";
import { Link } from "react-router-dom";

function Community() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); //short cut을 위한 카테고리 selector

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 10;

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
    if (!user || user.is_active === false || user.is_active === 0) {
      return "존재하지 않는 사용자입니다";
    }

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
          page: currentPage,
          limit: POSTS_PER_PAGE,
        });

        console.log("커뮤니티 게시글 목록 응답:", result);

        setPosts(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
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
  }, [category, search, currentPage]);

  return (
    <>
      <Navbar />
      <div className="board-page-wrapper">
        <main className="board-page">
          <div className="board-container">
            <div className="board-title-area">
              <h1 className="board-page-title">커뮤니티</h1>
              <div className="board-title-line"></div>
            </div>

            {/* 메뉴 영역 */}
            <div className="board-menu-area">
              {/* 글쓰기 */}
              <Link to="/community/write">
                <button className="board-write-btn btn btn-default">글쓰기</button>
              </Link>
              {/* 검색 영역 */}
              <div className="board-search-area">
                <select
                  className="form-control board-category-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCurrentPage(1);
                  }}
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
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
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
                      <Link
                        to={`/posts/${post.id}`}
                        className="board-link"
                        key={post.id}
                      >
                        <article className="board-card">
                          <div className="board-category">
                            {getCategoryText(post.category)}
                          </div>

                          <div className="board-body">
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
                      </Link>
                    ))
                  )}
                </section>
              )}
              {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main >
      </div >

      <Footer />
    </>
  );
}

export default Community;