// Gallery.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/board.css";
import "../styles/gallery.css";

import logoGreen from "../assets/images/logo-green.png";

function Gallery() {
  const dummyPosts = Array.from({ length: 90 }, (_, index) => ({
    id: index + 1,
    title: `테스트 게시글 ${index + 1}`,
    date: "2026-05-20",
    image: logoGreen,
  }));
  const posts = dummyPosts;

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 12;
  const PAGE_GROUP_SIZE = 5;

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.date.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

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
              <h1 className="board-page-title">갤러리</h1>
              <div className="board-title-line"></div>
            </div>

            <hr className="header-divider" />

            {/* 메뉴 영역 */}
            <div className="board-menu-area">
              {/* 검색 영역 */}
              <section className="gallery-button">
                <Link to="/post-write">
                  <button className="write-button btn btn-default">
                    글쓰기
                  </button>
                </Link>
              </section>
              <div className="board-search-area">
                <div className="input-group board-search-input">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="제목/날짜를 통해 검색"
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
              <div className="gallery-box">
                <div className="row">
                  {currentPosts.map((post) => (
                    <div className="col-sm-3" key={post.id}>
                      <Link to={`/post-detail/${post.id}`}>
                        <div className="gallery-post">
                          <section className="post-image-box">
                            <img
                              className="post-image img-responsive"
                              src={post.image}
                              alt="사진"
                            />
                          </section>

                          <section className="post-content">
                            <p className="post-date">{post.date}</p>

                            <p className="post-title">{post.title}</p>
                          </section>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
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
        </main >
      </div >
      <Footer />
    </>
  );
}

export default Gallery;
