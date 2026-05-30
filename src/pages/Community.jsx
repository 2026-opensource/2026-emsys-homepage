import { useState } from "react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/board.css";
import { Link } from "react-router-dom";

function Community() {
  // 더미 데이터
  const dummyPosts = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    category: ["자유", "질문", "공지사항", "팀원 모집"][index % 4],
    title: `테스트 게시글 ${index + 1}`,
    content: "테스트 내용입니다",
    author: "테스터",
    date: "2026-05-20",
    views: index * 3,
    likes: index,
    comments: index % 5,
  }));
  const posts = dummyPosts;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 5;
  const PAGE_GROUP_SIZE = 5;

  // 필터 정렬
  const filteredPosts = posts
    .filter((post) => {
      const matchCategory = category === "전체" || post.category === category;

      const matchSearch =
        post.title.includes(search) || post.content.includes(search);

      return matchCategory && matchSearch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 페이지네이션 관련
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // 현재 보여줄 페이지 번호 그룹
  const startPage =
    Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;

  const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

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
              <Link to="/post-write">
                <button className="write-button btn btn-default">글쓰기</button>
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
                  <option>전체</option>
                  <option>자유</option>
                  <option>질문</option>
                  <option>공지사항</option>
                  <option>팀원 모집</option>
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

              {/* 게시글 리스트 */}
              <section className="board-list">
                {currentPosts.map((post) => (
                  <a href="/post-detail" className="board-link" key={post.id}>
                    <article className="board-card">
                      <div className="board-category">{post.category}</div>

                      <div className="board-body">
                        <h2 className="board-title">{post.title}</h2>

                        <p className="board-info">
                          {post.author} · {post.date}
                        </p>
                      </div>

                      <div className="board-stats">
                        <p>조회수 {post.views}</p>
                        <p>좋아요 {post.likes}</p>
                        <p>댓글 {post.comments}</p>
                      </div>
                    </article>
                  </a>
                ))}
              </section>

              {/* 페이지네이션 */}
              <div className="pagination">
                {/* 이전 그룹 */}
                {startPage > 1 && (
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(startPage - 1)}
                  >
                    &lt;
                  </button>
                )}

                {/* 페이지 번호 */}
                {Array.from(
                  {
                    length: endPage - startPage + 1,
                  },
                  (_, index) => {
                    const pageNumber = startPage + index;

                    return (
                      <button
                        key={pageNumber}
                        className={
                          currentPage === pageNumber
                            ? "page-btn active"
                            : "page-btn"
                        }
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  },
                )}

                {/* 다음 그룹 */}
                {endPage < totalPages && (
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(endPage + 1)}
                  >
                    &gt;
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Community;
