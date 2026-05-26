import { useState } from "react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/board.css";

function Community() {
  // =========================
  // 1. 더미 게시글 데이터
  // =========================
  const posts = [
    {
      id: 1,
      category: "자유",
      title: "첫 번째 게시글 제목입니다",
      content: "첫 번째 게시글 내용 테스트",
      author: "홍길동",
      date: "2026-05-10",
      views: 12,
      likes: 7,
      comments: 3,
    },
    {
      id: 2,
      category: "질문",
      title: "두 번째 게시글입니다",
      content: "React 관련 질문입니다",
      author: "김철수",
      date: "2026-05-11",
      views: 5,
      likes: 2,
      comments: 1,
    },
    {
      id: 3,
      category: "공지",
      title: "공지입니다",
      content: "공지 테스트",
      author: "홍길동",
      date: "2026-05-14",
      views: 8,
      likes: 20,
      comments: 0,
    },
  ];

  // =========================
  // 2. 상태
  // =========================
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("카테고리");

  // =========================
  // 3. 필터 + 최신순 정렬
  // =========================
  const filteredPosts = posts
    .filter((post) => {
      const matchCategory =
        category === "카테고리" || post.category === category;

      const matchSearch =
        post.title.includes(search) || post.content.includes(search);

      return matchCategory && matchSearch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Navbar />

      {/* 메인 */}
      <div className="board-page-wrapper">
        <main className="board-page">
          <div className="board-container">
            {/* 제목 */}
            <div className="board-title-area">
              <h1 className="board-page-title">자료실</h1>
              <div className="title-line"></div>
            </div>

            {/* 본문 */}
            <div className="board-main-area">
              {/* 글쓰기 */}
              <a href="/post-write">
                <button type="button" className="write-btn">
                  글쓰기
                </button>
              </a>

              {/* 검색 영역 */}
              <div className="board-search-area">
                <select
                  className="form-control board-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>카테고리</option>
                  <option>자유</option>
                  <option>질문</option>
                  <option>공지</option>
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

              {/* 게시글 리스트 */}
              <section className="board-list">
                {filteredPosts.map((post) => (
                  <a href="/post-detail" className="board-link" key={post.id}>
                    <article className="board-card">
                      <div className="board-category">{post.category}</div>

                      <div className="board-main">
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
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Community;
