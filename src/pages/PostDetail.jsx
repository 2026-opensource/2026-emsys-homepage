import { useState } from "react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../styles/post-detail.css";
import "../styles/board.css";

function PostDetail() {
  // =========================
  // 좋아요 / 싫어요 상태
  // =========================
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [message, setMessage] = useState("");

  const [commentOpen, setCommentOpen] = useState(false);

  // =========================
  // 좋아요 클릭
  // =========================
  const handleLike = () => {
    if (dislike) {
      setMessage("이미 싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다.");
      return;
    }

    setLike(!like);
    if (like) setMessage("");
  };

  // =========================
  // 싫어요 클릭
  // =========================
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
          {/* =========================
              상단
          ========================= */}
          <div className="detail-top-area">
            <a href="/community" className="back-link">
              &lt; 목록으로
            </a>

            <div className="detail-top-buttons">
              <button className="edit-btn">게시글 수정</button>
              <button className="delete-btn">게시글 삭제</button>
            </div>
          </div>

          {/* =========================
              제목
          ========================= */}
          <section className="detail-header">
            <div className="title-line"></div>

            <div className="detail-title-area">
              <div className="board-category">자유</div>

              <div className="detail-title-content">
                <h1 className="detail-title">
                  게시글 제목입니다. 목이 도대체 왜
                </h1>
                <p className="detail-info">
                  홍길동 · 작성일 2026.05.10 · 조회수 6
                </p>
              </div>
            </div>
          </section>

          {/* =========================
              본문
          ========================= */}
          <section className="detail-content">
            <p>작성된 게시글 내용은 이렇게 보이게 될 것.</p>
          </section>

          {/* =========================
              좋아요 / 싫어요
          ========================= */}
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

          {/* =========================
          💬 댓글
          ========================= */}

          <div className="comment-wrapper">
            {/* 바깥 클릭 감지용 배경 */}
            {commentOpen && (
              <div
                className="comment-overlay"
                onClick={() => setCommentOpen(false)}
              ></div>
            )}

            {/* 펼쳐지는 댓글창 */}
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
