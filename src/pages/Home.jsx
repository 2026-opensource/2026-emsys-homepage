import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import MainCalendar from "../components/calendar/MainCalendar";
import ImageSlider from "../components/ImageSlider";

import "../layout/common.css";
import "../styles/home.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

function Home() {
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

                  {/* 불필요한 pull-right 클래스 제거 */}
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
              <a href="/resources" className="content-wrapper-link">
                <div className="content-wrapper">
                  <div className="title-group">
                    <i class="fa-regular fa-file-lines"></i>
                    <h3 className="about-title">자료실</h3>
                  </div>

                  {/* 불필요한 pull-right 클래스 제거 */}
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
              <a href="/community">
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
              <a href="https://software.cbnu.ac.kr/sub040301">
                <div className="shortcut-item">
                  <i className="fa-solid fa-location-dot"></i>
                  <h4>동아리 소개</h4>
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
                  <a href="/community" className="plus-btn">
                    <i className="fa-solid fa-plus"></i>
                  </a>
                </div>

                <hr className="home-board-divider" />

                <ul className="home-board-list">
                  <li>
                    <a href="#">2026년도 1학기 스터디 모집 안내</a>
                  </li>
                  <li>
                    <a href="#">EMSYS 2026년도 1학기 개강총회</a>
                  </li>
                  <li>
                    <a href="#">EMSYS 2026년도 1학기 MT</a>
                  </li>
                </ul>
              </div>
            </div>

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
                  <li>
                    <a href="#">운영체제 시험</a>
                  </li>
                  <li>
                    <a href="#">프로젝트 팀원구합니다</a>
                  </li>
                  <li>
                    <a href="#">오늘 휴강</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
