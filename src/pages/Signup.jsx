import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authAPI";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
        name: "",
        student_id: "",
        status: "",
        invitationCode: "",
    });

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

        console.log("회원가입 요청 데이터:", formData);

        if (formData.password !== formData.passwordConfirm) {
            setErrorMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        try {
            setLoading(true);

            await registerUser(formData);

            alert("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (error) {
            console.error("회원가입 실패:", error);

            setErrorMessage(
                error.response?.data?.message ||
                error.message ||
                "회원가입에 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />

            <div className="auth-page-wrapper">
                <div className="auth-content-area">
                    <section className="auth-box">
                        <div className="auth-container">
                            <h1 className="auth-text">SIGN UP</h1>
                            <p className="auth-subtext">
                                EMSYS에 오신걸 환영합니다!
                            </p>

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
                                    type="text"
                                    name="name"
                                    placeholder="이름"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="input-box"
                                    type="text"
                                    name="student_id"
                                    placeholder="학번"
                                    value={formData.student_id}
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
                                    required
                                />

                                <input
                                    className="input-box"
                                    type="password"
                                    name="passwordConfirm"
                                    placeholder="비밀번호 확인"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="input-box"
                                    type="text"
                                    name="invitationCode"
                                    placeholder="초대코드"
                                    value={formData.invitationCode}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="status-radio-group">
                                    <label className="status-title">상태</label>

                                    <label className="status-option">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="재학생"
                                            checked={formData.status === "재학생"}
                                            onChange={handleChange}
                                            required
                                        />
                                        재학생
                                    </label>

                                    <label className="status-option">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="휴학생"
                                            checked={formData.status === "휴학생"}
                                            onChange={handleChange}
                                        />
                                        휴학생
                                    </label>

                                    <label className="status-option">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="졸업생"
                                            checked={formData.status === "졸업생"}
                                            onChange={handleChange}
                                        />
                                        졸업생
                                    </label>
                                </div>

                                <button
                                    className="auth-btn"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "회원가입 중" : "회원가입"}
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