import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { changePassword } from "../api/authAPI";
import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

function ChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const resetToken = location.state?.resetToken;  // FindAccount에서 넘겨준 토큰

    const [newPwForm, setNewPwForm] = useState({ newPassword: '', newPasswordConfirm: '' });

    // 토큰 없이 직접 접근하면 막기
    if (!resetToken) {
        return (
            <>
                <Navbar />
                <div className="auth-page-wrapper">
                    <div className="auth-content-area">
                        <section className="change-pw-box">
                            <div className="auth-container">
                                <p>잘못된 접근입니다.</p>
                                <a className="link-text" href="/find-account">돌아가기</a>
                            </div>
                        </section>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        try {
            await changePassword({ resetToken, ...newPwForm });
            alert('비밀번호가 변경되었습니다.');
            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        }
    }

    return (
        <>
            <Navbar />
            <div className="auth-page-wrapper">
                <div className="auth-content-area">
                    <section className="change-pw-box">
                        <div className="auth-container">
                            <h1 className="change-pw-text">비밀번호 변경</h1>
                            <p className="change-pw-subtext">비밀번호를 변경하세요</p>

                            <form className="change-pw-form" onSubmit={handleChangePassword}>
                                <input
                                    className="input-box"
                                    type="password"
                                    placeholder="새 비밀번호"
                                    value={newPwForm.newPassword}
                                    onChange={(e) => setNewPwForm({ ...newPwForm, newPassword: e.target.value })}
                                    required
                                />
                                <input
                                    className="input-box"
                                    type="password"
                                    placeholder="새 비밀번호 확인"
                                    value={newPwForm.newPasswordConfirm}
                                    onChange={(e) => setNewPwForm({ ...newPwForm, newPasswordConfirm: e.target.value })}
                                    required
                                />
                                <button className="auth-btn" type="submit">
                                    비밀번호 변경
                                </button>
                            </form>

                            <p className="login-link">
                                <a className="link-text" href="/login">로그인 페이지로 이동</a>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ChangePassword;