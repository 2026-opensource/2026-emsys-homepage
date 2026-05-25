import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/board.css";

function Community() {
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

            {/* 메뉴 영역부터 본문 영역까지 */}
            <div className="board-main-area">
              {/* 글쓰기 버튼 */}
              <a href="/post-write">
                <button type="button" className="write-btn">
                  글쓰기
                </button>
              </a>

              {/* 검색 영역 */}
              <div className="board-search-area">
                <select className="form-control board-category-select">
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

              {/* 게시글 목록 */}
              <section className="board-list">
                {/* 게시글 1 */}
                <a href="/post-detail" className="board-link">
                  <article className="board-card">
                    {/* 카테고리 */}
                    <div className="board-category">자유</div>

                    {/* 본문 */}
                    <div className="board-main">
                      <h2 className="board-title">
                        첫 번째 게시글 제목입니다. 테스트를 위해 제목을 길게
                        적어보고 있습니다. 이쯤되면 두 줄은 넘겠죠?
                      </h2>

                      <p className="board-info">홍길동 · 2026-05-10</p>
                    </div>

                    {/* 통계 */}
                    <div className="board-stats">
                      <p>조회수 12</p>
                      <p>좋아요 7</p>
                      <p>댓글 3</p>
                    </div>
                  </article>
                </a>

                {/* 게시글 2 */}
                <a href="/post-detail" className="board-link">
                  <article className="board-card">
                    {/* 카테고리 */}
                    <div className="board-category">자유</div>

                    {/* 본문 */}
                    <div className="board-main">
                      <h2 className="board-title">
                        두 번째 게시글 제목입니다. 테스트를 위해 제목을 길게
                        적어보고 있습니다. 이쯤되면 두 줄은 넘겠죠?
                      </h2>

                      <p className="board-info">홍길동 · 2026-05-10</p>
                    </div>

                    {/* 통계 */}
                    <div className="board-stats">
                      <p>조회수 12</p>
                      <p>좋아요 7</p>
                      <p>댓글 3</p>
                    </div>
                  </article>
                </a>
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
