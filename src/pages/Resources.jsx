import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts } from "../api/postAPI";
import { isAuthError, redirectToLogin, requireLogin } from "../utils/token";

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

const SUB_CATEGORY_OPTIONS = {
  all: [
    "초급반",
    "중급반",
    "심화반",
    "전필-수업자료/과제",
    "전필-족보",
    "전선-수업자료/과제",
    "전선-족보",
    "교양-수업자료/과제",
    "교양-족보",
  ],
  study: ["초급반", "중급반", "심화반"],
  project: [],
  contest: [],
  class: [
    "전필-수업자료/과제",
    "전필-족보",
    "전선-수업자료/과제",
    "전선-족보",
    "교양-수업자료/과제",
    "교양-족보",
  ],
};

function Resources() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 15;

  function getCategoryText(category) {
    if (category === "class") return "수업";
    if (category === "study") return "스터디";
    if (category === "project") return "프로젝트";
    if (category === "contest") return "대회/공모전";
    return category;
  }

  function getPostTitlePrefix(post) {
    if (post.sub_category) return post.sub_category;

    return "";
  }

  const subCategoryOptions = SUB_CATEGORY_OPTIONS[category] || [];
  const hasSubCategoryOptions = subCategoryOptions.length > 0;

  // 게시판 목록에서는 학번 이름
  function getUserDisplayName(user) {
    if (!user || user.is_active === false || user.is_active === 0) {
      return "존재하지 않는 사용자입니다";
    }

    const studentYear = user.student_id?.slice(2, 4) || "";

    return `${studentYear} ${user.name}`;
  }

  // DB에서 자료실 게시글 목록 가져오기
  useEffect(() => {
    async function fetchPosts() {
      if (!requireLogin(navigate)) return;

      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPosts({
          board_type: "ARCHIVE",
          category,
          sub_category: subCategory,
          search,
          page: currentPage,
          limit: POSTS_PER_PAGE,
          sort,
        });

        console.log("자료실 게시글 목록 응답:", result);

        setPosts(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("게시글 목록 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
          "게시글 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, subCategory, search, sort, currentPage, navigate]);

  const handleWriteClick = (event) => {
    if (!requireLogin(navigate)) {
      event.preventDefault();
    }
  };

  return (
    <>
      <Navbar />
      <div className="board-page-wrapper">
        <main className="board-page">
          <div className="board-container">
            <div className="board-title-area board-title-compact">
              <h1 className="board-page-title">자료실</h1>
              <div className="board-title-line"></div>
            </div>

            {/* 메뉴 영역 */}
            <div className="board-menu-area board-menu-flat">
              <div className="board-toolbar">
                {/* 글쓰기 */}
                <Link
                  to="/resources/write"
                  className="board-toolbar-write-link"
                  onClick={handleWriteClick}
                >
                  <button type="button" className="board-write-btn btn btn-default">글쓰기</button>
                </Link>

                {/* 검색 영역 */}
                <div className="board-search-area board-filter-area">
                  <select
                    className="form-control board-category-select board-select board-select-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory("all");
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">게시판 선택</option>
                    <option value="class">수업</option>
                    <option value="study">스터디</option>
                    <option value="project">과제/프로젝트</option>
                    <option value="contest">대회/공모전</option>
                  </select>

                  <select
                    className="form-control board-category-select board-select board-select-sub"
                    value={hasSubCategoryOptions ? subCategory : ""}
                    onChange={(e) => {
                      setSubCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={!hasSubCategoryOptions}
                  >
                    {hasSubCategoryOptions ? (
                      <>
                        <option value="all">세부 말머리</option>
                        {subCategoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">말머리 없음</option>
                    )}
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

              {loading && <p className="board-message">게시글을 불러오는 중...</p>}

              {errorMessage && <p className="board-error">{errorMessage}</p>}

              {/* 게시글 리스트 */}
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
                        posts.map((post) => {
                          const titlePrefix = getPostTitlePrefix(post);

                          return (
                            <Link
                              to={`/posts/${post.id}`}
                              className="board-link"
                              key={post.id}
                            >
                              <article className="board-card">
                                <span className="board-list-category">
                                  {getCategoryText(post.category)}
                                </span>
                                <h2 className="board-title">
                                  {titlePrefix && (
                                    <span className="board-title-prefix">
                                      [{titlePrefix}]
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
                          );
                        })
                      )}
                    </div>
                  </div>
                </section>
              )}
              <Link
                to="/resources/write"
                className="board-mobile-write-link"
                onClick={handleWriteClick}
              >
                <button className="board-write-btn btn btn-default">
                  글쓰기
                </button>
              </Link>

              {/* 페이지네이션 */}
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

export default Resources;
