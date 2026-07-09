import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { saveToken, isLoggedIn, saveUserInfo } from "../utils/token";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    if (isLoggedIn()) {
      alert("이미 로그인되어 있습니다.");
      navigate("/");
    }
  }, [navigate]);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    console.log("로그인 요청 데이터:", formData);

    try {
      setLoading(true);

      const result = await loginUser(formData);

      console.log("로그인 응답:", result);

      const token =
        result.data?.token ||
        result.token ||
        result.accessToken;

      if (!token) {
        throw new Error("로그인 토큰을 받지 못했습니다.");
      }

      saveToken(token);
      saveUserInfo(result.data.user);

      alert("로그인이 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);

      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        "로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  // 캡스락 눌렸는지 체크
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  function checkCapsLock(e) {
    setIsCapsLockOn(e.getModifierState("CapsLock"));
  }

  // input에서 포커스 헤재되면 자동으로 캡스락 false로
  function resetCapsLock() {
    setIsCapsLockOn(false);
  }

  return (
    <>
      <Navbar />
      <div className="auth-page-wrapper">
        <div className="auth-content-area">
          <section className="auth-box">
            <div className="auth-container">
              <h1 className="auth-text">LOGIN</h1>
              <p className="auth-subtext">로그인하세요</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {errorMessage && (
                  <p className="error-message">
                    {errorMessage}
                  </p>
                )}
                <input
                  className="input-box"
                  type="email"
                  name="email"
                  placeholder="아이디(이메일)"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <input
                  className="input-box"
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onBlur={resetCapsLock}
                  required
                />
                {isCapsLockOn && (
                  <p className="caps-lock-warning">
                    *CAPS LOCK이 켜져 있습니다.
                  </p>
                )}

                <button
                  className="auth-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "로그인 중" : "로그인"}
                </button>
              </form>

              <p className="signup-link">
                계정이 없으신가요?{" "}
                <a className="link-text" href="/signup">
                  회원가입
                </a>
              </p>

              <p className="find-link">
                계정을 잃어버리셨나요?{" "}
                <a className="link-text" href="/find-account">
                  ID 찾기/PW 변경
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

export default Login;
