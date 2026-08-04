import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";
import { findEmail, verifyPasswordUser } from "../api/authAPI";

function FindAccount() {
    const [activeTab, setActiveTab] = useState("find-id");

    // 이메일 찾기
    const [idForm, setIdForm] = useState({ name: '', student_id: '' });
    const [foundEmail, setFoundEmail] = useState(null);

    // 비밀번호 변경
    const navigate = useNavigate();
    const [pwForm, setPwForm] = useState({ name: '', student_id: '', email: '' });

    async function handleFindId(e) {
        e.preventDefault();
        try {
            const res = await findEmail(idForm);
            setFoundEmail(res.data.email);
        } catch (err) {
            alert(err.response?.data?.message || '일치하는 사용자 정보를 찾을 수 없습니다.');
        }
    }
    async function handleVerifyUser(e) {
        e.preventDefault();
        try {
            const res = await verifyPasswordUser(pwForm);
            navigate("/change-password", { state: { resetToken: res.data.resetToken } });
        } catch (err) {
            alert(err.response?.data?.message || '사용자 정보가 일치하지 않습니다.');
        }
    }

    return (
        <>
            <Navbar />
            <div className="auth-page-wrapper">
                <div className="auth-content-area">
                    <section className="auth-box">
                        <div className="auth-container">
                            <ul className="nav nav-tabs find-tabs">
                                <li className={activeTab === "find-id" ? "active" : ""}>
                                    <a href="#find-id" onClick={(e) => { e.preventDefault(); setActiveTab("find-id"); }}>
                                        이메일 찾기
                                    </a>
                                </li>
                                <li className={activeTab === "find-pw" ? "active" : ""}>
                                    <a href="#find-pw" onClick={(e) => { e.preventDefault(); setActiveTab("find-pw"); }}>
                                        비밀번호 변경
                                    </a>
                                </li>
                            </ul>

                            <div className="tab-content find-content">
                                <div className={activeTab === "find-id" ? "tab-pane fade in active" : "tab-pane fade"}>
                                    <form className="find-form" onSubmit={handleFindId}>
                                        <input className="input-box" type="text" placeholder="이름" value={idForm.name}
                                            onChange={(e) => setIdForm({ ...idForm, name: e.target.value })} required />
                                        <input className="input-box" type="text" placeholder="학번" value={idForm.student_id}
                                            onChange={(e) => setIdForm({ ...idForm, student_id: e.target.value })} required />
                                        <button className="auth-btn" type="submit">이메일 찾기</button>
                                        {foundEmail && (
                                            <div className="result-box">
                                                <i className="fa-solid fa-envelope"></i>
                                                <span className="result-email">{foundEmail}</span>
                                            </div>
                                        )}
                                        <p className="login-link">
                                            <a className="link-text" href="/login">로그인 페이지로 이동</a>
                                        </p>
                                    </form>
                                </div>

                                <div className={activeTab === "find-pw" ? "tab-pane fade in active" : "tab-pane fade"}>


                                    <h2 className="check-info-text">사용자 정보 확인</h2>
                                    <form className="find-form" onSubmit={handleVerifyUser}>
                                        <input className="input-box" type="text" placeholder="이름" value={pwForm.name}
                                            onChange={(e) => setPwForm({ ...pwForm, name: e.target.value })} required />
                                        <input className="input-box" type="text" placeholder="학번" value={pwForm.student_id}
                                            onChange={(e) => setPwForm({ ...pwForm, student_id: e.target.value })} required />
                                        <input className="input-box" type="email" placeholder="이메일" value={pwForm.email}
                                            onChange={(e) => setPwForm({ ...pwForm, email: e.target.value })} required />
                                        <button className="auth-btn" type="submit">비밀번호 변경하러 가기</button>
                                    </form>
                                    <p className="login-link">
                                        <a className="link-text" href="/login">로그인 페이지로 이동</a>
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