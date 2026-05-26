import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

function ChangePassword() {
return (
<>
    <Navbar />

    <div className="auth-page-wrapper">
        <div className="auth-content-area">
            <section className="change-pw-box">
                <div className="auth-container">
                    <h1 className="change-pw-text">비밀번호 변경</h1>
                    <p className="change-pw-subtext">비밀번호를 변경하세요</p>

                    <form className="change-pw-form">
                        <input className="input-box" type="password" name="new-password" placeholder="새 비밀번호"required />
                        <input className="input-box" type="password" name="confirm-new-password" placeholder="새 비밀번호 확인"required />
                        <button className="auth-btn" type="submit">
                            비밀번호 변경
                        </button>
                    </form>

                    <p className="login-link">
                        <a className="link-text" href="/login">
                            로그인 페이지로 이동
                        </a>
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