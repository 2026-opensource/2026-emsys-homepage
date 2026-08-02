// Gallery.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts } from "../api/postAPI";
import { isLoggedIn, redirectToLogin } from "../utils/token";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/pagination";

import "../layout/common.css";
import "../styles/board.css";
import "../styles/gallery.css";

function Gallery() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 12;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  function getImageUrl(path) {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `${API_BASE_URL}${path}`;
  }

  // 카테고리 key를 화면에 보여줄 한글로 변환
  function getCategoryText(category) {
    if (category === "activity") return "활동";
    return category;
  }

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPosts({
          board_type: "GALLERY",
          category,
          search,
          page: currentPage,
          limit: POSTS_PER_PAGE,
        });

        console.log("갤러리 게시글 목록 응답:", result);

        setPosts(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("게시글 목록 조회 실패:", error);

        setErrorMessage(
          error.response?.data?.message ||
            "갤러리 게시글을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category, search, currentPage]);

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
            <div className="board-title-area">
              <h1 className="board-page-title">갤러리</h1>
              <div className="board-title-line"></div>
            </div>

            {/* 메뉴 영역 */}
            <div className="board-menu-area">
              {/* 글쓰기 */}
              <Link to="/gallery/write" onClick={handleWriteClick}>
                <button className="board-write-btn btn btn-default">
                  글쓰기
                </button>
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
                  <option value="activity">활동</option>
                </select>

                <div className="board-input-area">
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

              {loading && (
                <p className="board-message">게시글을 불러오는 중...</p>
              )}

              {errorMessage && <p className="board-error">{errorMessage}</p>}

              {/* 게시글 리스트 */}
              {!loading && !errorMessage && (
                <div className="gallery-box">
                  {posts.length === 0 ? (
                    <p className="board-message">
                      작성된 갤러리 게시글이 없습니다.
                    </p>
                  ) : (
                    <div className="row">
                      {posts.map((post) => {
                        const firstImage = post.post_images?.[0];

                        return (
                          <div className="col-sm-3" key={post.id}>
                            <Link to={`/posts/${post.id}`}>
                              <div className="gallery-post">
                                <section className="post-image-box">
                                  <img
                                    className="post-image img-responsive"
                                    src={getImageUrl(firstImage?.thumbnail_url)}
                                    alt={
                                      firstImage?.original_name ||
                                      "갤러리 썸네일"
                                    }
                                  />
                                </section>

                                <section className="post-content">
                                  <p className="post-date">
                                    {post.created_at?.slice(0, 10)}
                                  </p>

                                  <p className="post-title">{post.title}</p>
                                </section>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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

export default Gallery;
