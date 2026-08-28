import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts } from "../api/postAPI";
import { getUserRole, isLoggedIn, redirectToLogin } from "../utils/token";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/pagination";

import "../layout/common.css";
import "../styles/board.css";

const POST_SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회수 순" },
  { value: "likes", label: "좋아요 순" },
  { value: "comments", label: "댓글 순" },
];

const SUB_CATEGORY_OPTIONS = ["공지"];

function Notice() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [subCategory, setSubCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 15;
  const role = getUserRole();
  const isAdmin = role === "PRESIDENT" || role === "OFFICER";

  function getUserDisplayName(user) {
    if (!user || user.is_active === false || user.is_active === 0) {
      return "존재하지 않는 사용자입니다";
    }

    const studentYear = user.student_id?.slice(2, 4) || "";

    return `${studentYear} ${user.name}`;
  }

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPosts({
          board_type: "COMMUNITY",
          category: "notice",
          sub_category: subCategory,
          search,
          page: currentPage,
          limit: POSTS_PER_PAGE,
          sort,
        });

        setPosts(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("공지사항 게시글 목록 조회 실패:", error);

        setErrorMessage(
          error.response?.data?.message || "게시글 목록을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [subCategory, search, sort, currentPage]);

  const handleWriteClick = (event) => {
    if (!isLoggedIn()) {
      event.preventDefault();
      redirectToLogin(navigate);
    }
  };

  return (
    <>
      <Navbar />
      <div className="board-page-wrapper">
        <main className="board-page">
          <div className="board-container">
            <div className="board-title-area board-title-compact">
              <h1 className="board-page-title">공지사항</h1>
              <div className="board-title-line"></div>
            </div>

            <div className="board-menu-area board-menu-flat">
              <div className="board-toolbar">
                {isAdmin && (
                  <Link
                    to="/notice/write"
                    className="board-toolbar-write-link"
                    onClick={handleWriteClick}
                  >
                    <button className="board-write-btn btn btn-default">
                      글쓰기
                    </button>
                  </Link>
                )}

                <div className="board-search-area board-filter-area">
                  <select
                    className="form-control board-category-select board-select board-select-category"
                    value="notice"
                    disabled
                  >
                    <option value="notice">공지사항</option>
                  </select>

                  <select
                    className="form-control board-category-select board-select board-select-sub"
                    value={subCategory}
                    onChange={(e) => {
                      setSubCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">세부 말머리</option>
                    {SUB_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control board-category-select board-select"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {POST_SORT_OPTIONS.map((option) => (
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
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {loading && (
                <p className="board-message">게시글을 불러오는 중...</p>
              )}

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
                        <p className="board-message">작성된 게시글이 없습니다.</p>
                      ) : (
                        posts.map((post) => (
                          <Link
                            to={`/posts/${post.id}`}
                            className="board-link"
                            key={post.id}
                          >
                            <article className="board-card">
                              <span className="board-list-category">
                                공지사항
                              </span>
                              <h2 className="board-title">
                                {post.sub_category && (
                                  <span className="board-title-prefix">
                                    [{post.sub_category}]
                                  </span>
                                )}{" "}
                                {post.title}
                              </h2>

                              <div className="board-meta">
                                <span className="board-author">
                                  {getUserDisplayName(post.users)}
                                </span>
                                <time
                                  className="board-date"
                                  dateTime={post.created_at}
                                >
                                  {post.created_at?.slice(0, 10)}
                                </time>
                                <span className="board-stat board-stat-view">
                                  {post.view_count ?? 0}
                                </span>
                                <span className="board-stat board-stat-like">
                                  {post._count?.post_likes ?? 0}
                                </span>
                                <span className="board-stat board-stat-comment">
                                  {post._count?.comments ?? 0}
                                </span>
                              </div>
                            </article>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )}
              {isAdmin && (
                <Link
                  to="/notice/write"
                  className="board-mobile-write-link"
                  onClick={handleWriteClick}
                >
                  <button className="board-write-btn btn btn-default">
                    글쓰기
                  </button>
                </Link>
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

export default Notice;
