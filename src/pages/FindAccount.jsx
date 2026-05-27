import { useState } from "react";
import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

function FindAccount() {
const [activeTab, setActiveTab] = useState("find-id");

return (
<>
    <Navbar />

    <div className="auth-page-wrapper">
        <div className="auth-content-area">
            <section className="auth-box">
                <div className="auth-container">
                    <ul className="nav nav-tabs find-tabs">
                        <li className={activeTab==="find-id" ? "active" : "" }>
                            <a href="#find-id" onClick={(e)=> {
                                e.preventDefault();
                                setActiveTab("find-id");
                                }}
                                >
                                아이디 찾기
                            </a>
                        </li>

                        <li className={activeTab==="find-pw" ? "active" : "" }>
                            <a href="#find-pw" onClick={(e)=> {
                                e.preventDefault();
                                setActiveTab("find-pw");
                                }}
                                >
                                비밀번호 변경
                            </a>
                        </li>
                    </ul>

                    <div className="tab-content find-content">
                        <div id="find-id" className={ activeTab==="find-id" ? "tab-pane fade in active"
                            : "tab-pane fade" }>
                            <form className="find-form">
                                <input className="input-box" type="text" name="name" placeholder="이름" required />
                                <input className="input-box" type="text" name="student-id" placeholder="학번" required />
                                <button className="auth-btn" type="submit">
                                    아이디 찾기
                                </button>
                                <p className="login-link">
                                    <a className="link-text" href="/login">
                                        로그인 페이지로 이동
                                    </a>
                                </p>
                            </form>
                        </div>

                        <div id="find-pw" className={ activeTab==="find-pw" ? "tab-pane fade in active"
                            : "tab-pane fade" }>
                            <h2 className="check-info-text">사용자 정보 확인</h2>

                            <form className="find-form">
                                <input className="input-box" type="text" name="name" placeholder="이름" required />
                                <input className="input-box" type="text" name="student-id" placeholder="학번" required />
                                <input className="input-box" type="email" name="email" placeholder="아이디(이메일)"
                                    autoComplete="email" required />
                                <button className="auth-btn" type="submit">
                                    비밀번호 변경하러 가기
                                </button>
                            </form>

                            <p className="login-link">
                                <a className="link-text" href="/login">
                                    로그인 페이지로 이동
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <Footer />
</>
);
}

export default FindAccount;