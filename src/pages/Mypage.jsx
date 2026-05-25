import React from "react";
import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/mypage.css";

function MyPage() {
  return (
    <>
      <Navbar />
      <div className="mypage-container">
        <h1 className="mypage-text">마이페이지</h1>

        {/* 사용자 정보 */}
        <div className="user-info-box">
          <h2 className="section-title">사용자 정보</h2>
          <hr className="header-divider" />

          <div className="user-info-body">
            <section className="profile-image-section">
              <img
                className="img-circle profile-image"
                src="../assets/images/기본_프로필.png"
                alt="프로필 이미지"
              />
            </section>

            <section className="user-info-content1">
              <div className="user-info-inner-box">
                <div className="user-info-row">
                  <div className="user-info-label">사용자 이름</div>
                  <div className="user-info-value">홍길동</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">등급</div>
                  <div className="user-info-value">부원/임원/회장</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">학번</div>
                  <div className="user-info-value">20XXXXXXXX</div>
                </div>

                <div className="user-info-row">
                  <div className="user-info-label">아이디(이메일)</div>
                  <div className="user-info-value">qwer1234@gmail.com</div>
                </div>
              </div>
            </section>

            <section className="user-info-content2">
              <div className="user-history-box">
                <p className="user-history">방문 : XX 회</p>
                <p className="user-history">작성한 글 : XX 개</p>
                <p className="user-history">작성한 댓글 : XX 개</p>
                <p className="user-history">내가 좋아요한 글 : XX 개</p>
              </div>
            </section>
          </div>
        </div>

        {/* 내가 작성한 글 */}
        <section className="my-posts-box">
          <div className="posts-header">
            <h2 className="section-title">내가 작성한 글</h2>
            <a className="community-link" href="community.html">
              +
            </a>
          </div>

          <hr className="header-divider" />

          <div className="section-box">
            <div className="board-list">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <a key={item} href="./post-detail.html" className="board-link">
                  <article className="board-card">
                    <div className="board-row">
                      <div className="board-category">자유</div>

                      <div className="board-main">
                        <h2 className="board-title">
                          첫 번째 게시글 제목입니다
                        </h2>
                        <p className="board-info">홍길동 · 2026-05-10</p>
                      </div>

                      <div className="board-stats">
                        <p>조회수 12</p>
                        <p>좋아요 7</p>
                        <p>댓글 3</p>
                      </div>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default MyPage;
