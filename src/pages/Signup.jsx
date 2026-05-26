import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

function Signup() {
return (
<>
    <Navbar />

    <div className="auth-page-wrapper">
        <div className="auth-content-area">
            <section className="auth-box">
                <div className="auth-container">
                    <h1 className="auth-text">SIGN UP</h1>
                    <p className="auth-subtext">EMSYS에 오신걸 환영합니다!</p>

                    <form className="auth-form">
                        <input className="input-box" type="email" name="email" placeholder="아이디(이메일)" required />
                        <input className="input-box" type="text" name="name" placeholder="이름" required />
                        <input className="input-box" type="text" name="student-id" placeholder="학번" required />
                        <input className="input-box" type="password" name="password" placeholder="비밀번호" required />
                        <input className="input-box" type="password" name="confirm-password" placeholder="비밀번호 확인"required />
                        <input className="input-box" type="text" name="invite-code" placeholder="초대코드" required />
                        <button className="auth-btn" type="submit">
                            회원가입
                        </button>
                    </form>

                    <p className="login-link">
                        이미 계정이 있으신가요?{" "}
                        <a className="link-text" href="/login">
                            로그인
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

export default Signup;