import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPopularPosts } from "../api/postAPI";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/pagination";

import "../layout/common.css";
import "../styles/board.css";

const CATEGORY_OPTIONS = [
  { value: "all", label: "게시판 선택" },
  { value: "free", label: "자유" },
  { value: "qna", label: "질문" },
  { value: "recruit", label: "팀원 모집" },
];

function Popular() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 15;

  useEffect(() => {
    async function fetchPopularPosts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPopularPosts({
          category,
          search,
          page: currentPage,
          limit: POSTS_PER_PAGE,
        });

        setPosts(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("인기글 목록 조회 실패:", error);
        setErrorMessage(
          error.response?.data?.message || "인기글을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPopularPosts();
  }, [category, search, currentPage]);

  function getCategoryText(value) {
    return CATEGORY_OPTIONS.find((option) => option.value === value)?.label || value;
  }

  function getUserDisplayName(user) {
    if (!user || user.is_active === false || user.is_active === 0) {
      return "존재하지 않는 사용자입니다";
    }

    return `${user.student_id?.slice(2, 4) || ""} ${user.name}`;
  }

  return (
    <>
      <Navbar />
      <div className="board-page-wrapper">
        <main className="board-page">
          <div className="board-container">
            <div className="board-title-area board-title-compact">
              <h1 className="board-page-title">인기글</h1>
              <div className="board-title-line" />
            </div>

            <div className="board-menu-area board-menu-flat">
              <div className="board-toolbar board-toolbar-end">
                <div className="board-search-area board-filter-area">
                  <select
                    className="form-control board-category-select board-select board-select-category"
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="board-input-area board-search-box">
                    <input
                      type="text"
                      className="form-control search-input"
                      placeholder="제목 또는 내용을 입력하세요"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {loading && <p className="board-message">인기글을 불러오는 중...</p>}
              {errorMessage && <p className="board-error">{errorMessage}</p>}

              {!loading && !errorMessage && (
                <section className="board-list-section">
                  <div className="board-list-scroll">
                    <div className="board-list-header" aria-hidden="true">
                      <span>카테고리</span>
                      <span>제목</span>
                      <span>작성자</span>
                      <span>작성일</span>
                      <span>조회수</span>
                      <span>좋아요</span>
                      <span>댓글</span>
                    </div>

                    <div className="board-list">
                      {posts.length === 0 ? (
                        <p className="board-message">좋아요 10개 이상의 인기글이 없습니다.</p>
                      ) : (
                        posts.map((post) => (
                          <Link to={`/posts/${post.id}`} className="board-link" key={post.id}>
                            <article className="board-card">
                              <span className="board-list-category">
                                {getCategoryText(post.category)}
                              </span>
                              <h2 className="board-title">
                                {post.sub_category && (
                                  <span className="board-title-prefix">
                                    [{post.sub_category}]
                                  </span>
                                )}{" "}
                                {post.title}
                              </h2>
                              <span className="board-author">
                                {getUserDisplayName(post.users)}
                              </span>
                              <time className="board-date" dateTime={post.created_at}>
                                {post.created_at?.slice(0, 10)}
                              </time>
                              <span className="board-stat">{post.view_count ?? 0}</span>
                              <span className="board-stat">{post._count?.post_likes ?? 0}</span>
                              <span className="board-stat">{post._count?.comments ?? 0}</span>
                            </article>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default Popular;
