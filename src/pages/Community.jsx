import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPosts } from "../api/postAPI";
import { isLoggedIn, redirectToLogin } from "../utils/token";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/pagination";

import "../layout/common.css";
import "../styles/board.css";

const COMMUNITY_POST_SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회수 순" },
  { value: "likes", label: "좋아요 순" },
  { value: "comments", label: "댓글 순" },
];

const SUB_CATEGORY_OPTIONS = {
  all: ["소모임", "게임", "기타", "공모전", "스터디"],
  free: ["소모임", "게임", "기타"],
  qna: [],
  recruit: ["공모전", "스터디", "소모임"],
};

const COMMUNITY_CATEGORY_VALUES = ["all", "free", "qna", "recruit"];

function Community() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); //short cut을 위한 카테고리 selector

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const initialCategory = searchParams.get("category") || "all";
  const [category, setCategory] = useState(
    COMMUNITY_CATEGORY_VALUES.includes(initialCategory) ? initialCategory : "all",
  );
  const [subCategory, setSubCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 15;

  // 카테고리 key를 화면에 보여줄 한글로 변환
  function getCategoryText(category) {
    if (category === "free") return "자유";
    if (category === "qna") return "질문";
    if (category === "recruit") return "팀원 모집";
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

  // DB에서 커뮤니티 게시글 목록 가져오기
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPosts({
          board_type: "COMMUNITY",
          category,
          sub_category: subCategory,
          exclude_category: "notice",
          search,
          page: currentPage,
          limit: POSTS_PER_PAGE,
          sort,
        });

        console.log("커뮤니티 게시글 목록 응답:", result);

        setPosts(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("게시글 목록 조회 실패:", error);

        setErrorMessage(
          error.response?.data?.message || "게시글 목록을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, subCategory, search, sort, currentPage]);

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
              <h1 className="board-page-title">커뮤니티</h1>
              <div className="board-title-line"></div>
            </div>

            {/* 메뉴 영역 */}
            <div className="board-menu-area board-menu-flat">
              <div className="board-toolbar">
                {/* 글쓰기 */}
                <Link
                  to="/community/write"
                  className="board-toolbar-write-link"
                  onClick={handleWriteClick}
                >
                  <button className="board-write-btn btn btn-default">
                    글쓰기
                  </button>
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
                    <option value="free">자유</option>
                    <option value="qna">질문</option>
                    <option value="recruit">팀원 모집</option>
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
                    {COMMUNITY_POST_SORT_OPTIONS.map((option) => (
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
                to="/community/write"
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

export default Community;
