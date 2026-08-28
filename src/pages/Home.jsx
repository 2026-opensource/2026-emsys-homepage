import { useState, useEffect } from "react";
import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import MainCalendar from "../components/calendar/MainCalendar";
import ImageSlider from "../components/ImageSlider";
import { getPosts } from "../api/postAPI";

import "../layout/common.css";
import "../styles/home.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

function Home() {
  const [date, setDate] = useState(new Date());
  const [noticePosts, setNoticePosts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [maintenancePosts, setMaintenancePosts] = useState([]);

  useEffect(() => {
    async function fetchPreviews() {
      try {
        const noticeResult = await getPosts({
          board_type: "COMMUNITY",
          category: "notice",
          page: 1,
          limit: 3,
        });
        setNoticePosts(noticeResult.data || []);

        const communityResult = await getPosts({
          board_type: "COMMUNITY",
          exclude_category: "notice",
          page: 1,
          limit: 3,
        });
        setCommunityPosts(communityResult.data || []);

        const maintenanceResult = await getPosts({
          board_type: "MAINTENANCE",
          page: 1,
          limit: 3,
        });
        setMaintenancePosts(maintenanceResult.data || []);
      } catch (error) {
        console.error("홈 게시글 로드 실패:", error);
      }
    }
    fetchPreviews();
  }, []);

  return (
    <>
      <Navbar />
      <ImageSlider />
      <section className="about-section">
        <div className="home-container">
          <div className="section-divider">
            <div className="top-divider"></div>
          </div>

          <div className="row grey-row">
            <div className="col-sm-6 left-box">
              <a
                href="https://www.instagram.com/cbnu_emsys?igsh=MTl4ZXo0Nno4aHJ5Zg=="
                className="content-wrapper-link"
              >
                <div className="content-wrapper">
                  <div className="title-group">
                    <i className="fa-brands fa-instagram"></i>
                    <h3 className="about-title">Instagram</h3>
                  </div>


                  <div className="description-group">
                    <div className="arr-btn">
                      <span className="section-desc">
                        EMSYS 공식 인스타그램
                      </span>
                      <i className="fa-solid fa-circle-chevron-right"></i>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="col-sm-6 right-box">
              <a href="/introduce" className="content-wrapper-link">
                <div className="content-wrapper">
                  <div className="title-group">
                    <i className="fa-solid fa-location-dot"></i>
                    <h3 className="about-title">동아리 소개</h3>
                  </div>

                  <div className="description-group">
                    <div className="arr-btn">
                      <span className="section-desc">스터디 · 수업자료</span>
                      <i className="fa-solid fa-circle-chevron-right"></i>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="shortcut">
        <div className="home-container">
          <div className="section-divider">
            <div className="line"></div>
            <div className="shortcut-text">바로가기</div>
            <div className="line"></div>
          </div>

          <div className="row mint-row">
            <div className="col-6 col-sm-3">
              <a href="/gallery">
                <div className="shortcut-item">
                  <i className="fa-regular fa-image"></i>
                  <h4>갤러리</h4>
                </div>
              </a>
            </div>

            <div className="col-6 col-sm-3">
              <Link to="/notice">
                <div className="shortcut-item">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <h4>공지사항</h4>
                </div>
              </a>
            </div>

            <div className="col-6 col-sm-3">
              <a href="/community">
                <div className="shortcut-item">
                  <i className="fa-solid fa-users"></i>
                  <h4>커뮤니티</h4>
                </div>
              </a>
            </div>

            <div className="col-6 col-sm-3">
              <a href="/resources">
                <div className="shortcut-item">
                  <i className="fa-regular fa-file-lines"></i>
                  <h4>자료실</h4>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <MainCalendar />

      <section className="home-board-preview">
        <div className="home-container">
          <div className="row">
            <div className="col-sm-6">
              <div className="home-board-box">
                <div className="home-board-header">
                  <h3 className="home-board-title">공지사항</h3>
                  <a href="/notice" className="plus-btn">
                    <i className="fa-solid fa-plus"></i>
                  </a>
                </div>

                <hr className="home-board-divider" />

                <ul className="home-board-list">
                  {noticePosts.length === 0 ? (
                    <li>공지사항이 없습니다.</li>
                  ) : (
                    noticePosts.map((post) => (
                      <li key={post.id}>
                        <a href={`/posts/${post.id}`}>
                          {post.sub_category && `[${post.sub_category}] `}
                          {post.title}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="home-board-box">
                <div className="home-board-header">
                  <h3 className="home-board-title">점검안내</h3>
                  <a href="/maintenance" className="plus-btn">
                    <i className="fa-solid fa-plus"></i>
                  </a>
                </div>

                <hr className="home-board-divider" />

                <ul className="home-board-list">
                  {maintenancePosts.length === 0 ? (
                    <li>점검안내가 없습니다.</li>
                  ) : (
                    maintenancePosts.map((post) => (
                      <li key={post.id}>
                        <a href={`/posts/${post.id}`}>
                          {post.sub_category && `[${post.sub_category}] `}
                          {post.title}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="row home-board-row-secondary">
            <div className="col-sm-6">
              <div className="home-board-box">
                <div className="home-board-header">
                  <h3 className="home-board-title">커뮤니티</h3>
                  <a href="/community" className="plus-btn">
                    <i className="fa-solid fa-plus"></i>
                  </a>
                </div>

                <hr className="home-board-divider" />

                <ul className="home-board-list">
                  {communityPosts.length === 0 ? (
                    <li>게시글이 없습니다.</li>
                  ) : (
                    communityPosts.map((post) => (
                      <li key={post.id}>
                        <a href={`/posts/${post.id}`}>
                          {post.sub_category && `[${post.sub_category}] `}
                          {post.title}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* 자리 예약: 인기 게시글 미리보기가 여기에 커뮤니티와 나란히 추가될 예정 */}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
