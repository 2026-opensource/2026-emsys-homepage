import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";
import "../layout/common.css"

function Login() {
  return (
    <>
      <Navbar />
      <div className="auth-page-wrapper">
        <div className="auth-content-area">
          <section className="auth-box">
            <div className="auth-container">
              <h1 className="auth-text">LOGIN</h1>
              <p className="auth-subtext">로그인하세요</p>

              <form className="auth-form">
                <input
                  className="input-box"
                  type="email"
                  name="email"
                  placeholder="아이디(이메일)"
                  required
                />

                <input
                  className="input-box"
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  required
                />

                <button className="auth-btn" type="submit">
                  로그인
                </button>
              </form>

              <p className="signup-link">
                계정이 없으신가요?{" "}
                <a className="link-text" href="/signup">회원가입</a>
              </p>

              <p className="find-link">
                계정을 잃어버리셨나요?{" "}
                <a className="link-text" href="/find-account">ID 찾기/PW 변경</a>
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;