import { useState } from "react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../styles/post-detail.css";
import "../styles/board.css";

function PostDetail() {
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [message, setMessage] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);

  const handleLike = () => {
    if (dislike) {
      setMessage("이미 싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다.");
      return;
    }
    setLike(!like);
    if (like) setMessage("");
  };

  const handleDislike = () => {
    if (like) {
      setMessage("이미 좋아요를 누른 상태에서는 싫어요를 누를 수 없습니다.");
      return;
    }
    setDislike(!dislike);
    if (dislike) setMessage("");
  };

  return (
    <>
      <Navbar />

      <main className="board-page">
        <div className="detail-container">
          {/* 1. 상단 (목록으로, 수정/삭제 버튼) */}
          <div className="detail-top-area">
            {/* 자료실은 자료실, 커뮤니티는 커뮤니티로 돌아가게 해야 함*/}
            <a href="/community" className="back-link">
              &lt; 목록으로
            </a>

            <div className="detail-top-buttons">
              <button className="edit-btn">게시글 수정</button>
              <button className="delete-btn">게시글 삭제</button>
            </div>
          </div>

          {/* 2. 제목 및 정보 */}
          <section className="detail-header">
            <div className="title-line"></div>

            <div className="detail-title-area">
              <div className="board-category">자유</div>

              <div className="detail-title-content">
                <h1 className="detail-title">게시글 제목입니다.</h1>
                <p className="detail-info">
                  홍길동 · 작성일 2026.05.10 · 조회수 6
                </p>
              </div>
            </div>
          </section>

          {/* 3. 게시글 본문 */}
          <section className="detail-content">
            <p>작성된 게시글 내용은 이렇게 보이게 될 것.</p>
          </section>

          {/* 4. 피드백 (좋아요 / 싫어요) */}
          <section className="reaction-section">
            <button
              className={`reaction-btn ${like ? "active" : ""}`}
              onClick={handleLike}
            >
              👍 좋아요
            </button>

            <button
              className={`reaction-btn ${dislike ? "active" : ""}`}
              onClick={handleDislike}
            >
              👎 싫어요
            </button>
          </section>

          <p className="reaction-message">{message}</p>

          {/* 5. 댓글 영역 */}
          <div className="comment-wrapper">
            {/* 오버레이 (바깥 클릭 시 닫힘) */}
            {commentOpen && (
              <div
                className="comment-overlay"
                onClick={() => setCommentOpen(false)}
              ></div>
            )}

            {/* 활성화 시 펼쳐지는 댓글창 */}
            <div
              className={`comment-expand ${commentOpen ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="comment-title">💬 댓글</h2>

              <div className="comment-list">
                <div className="comment-card">
                  <div className="comment-main">
                    <p className="comment-writer">24000</p>
                    <p className="comment-text">첫 번째 댓글</p>
                  </div>
                  <div className="comment-actions">
                    <button className="comment-edit-btn">수정</button>
                    <button className="comment-delete-btn">삭제</button>
                  </div>
                </div>

                <div className="comment-card">
                  <div className="comment-main">
                    <p className="comment-writer">테스트</p>
                    <p className="comment-text">두 번째 댓글</p>
                  </div>
                  <div className="comment-actions">
                    <button className="comment-edit-btn">수정</button>
                    <button className="comment-delete-btn">삭제</button>
                  </div>
                </div>
              </div>

              <div className="comment-input-section">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="댓글을 입력하세요..."
                />
                <button className="comment-submit-btn">➤</button>
              </div>
            </div>

            {/* 댓글 미리보기 */}
            <div
              className="comment-preview"
              onClick={() => setCommentOpen(true)}
            >
              <h2 className="comment-title">💬 댓글 12개 보기</h2>

              <div className="comment-card">
                <div className="comment-main">
                  <p className="comment-writer">테스트</p>
                  <p className="comment-text">가장 최신 댓글 미리보기...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default PostDetail;
