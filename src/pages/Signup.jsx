import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import "../layout/common.css";
import "../styles/auth.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authAPI";

const SIGNUP_STEPS = ["기본 정보", "전화번호 인증", "비밀번호"];

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
        name: "",
        student_id: "",
        phone_number: "",
        status: "",
        invitationCode: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const isLastStep = currentStep === SIGNUP_STEPS.length - 1;

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    // 현재 단계 필드 다 입력했는지 확인
    function validateCurrentStep() {
        if (currentStep === 0) {
            if (!formData.email) {
                setErrorMessage("이메일을 입력해주세요.");
                return false;
            }

            if (!formData.name) {
                setErrorMessage("이름을 입력해주세요.");
                return false;
            }

            if (!formData.student_id) {
                setErrorMessage("학번을 입력해주세요.");
                return false;
            }
        }

        if (currentStep === 1) {
            if (!formData.phone_number.trim()) {
                setErrorMessage("전화번호를 입력해주세요.");
                return false;
            }

            if (!verificationCode.trim()) {
                setErrorMessage("인증번호를 입력해주세요.");
                return false;
            }
        }

        if (currentStep === 2) {
            if (!formData.password) {
                setErrorMessage("비밀번호를 입력해주세요.");
                return false;
            }

            if (!formData.passwordConfirm) {
                setErrorMessage("비밀번호 확인을 입력해주세요.");
                return false;
            }

            if (!formData.status) {
                setErrorMessage("학적 상태를 체크해주세요.");
                return false;
            }
        }
        return true;
    }

    // 다음 단계로 넘어가는 함수
    function handleNextStep() {
        setErrorMessage("");

        const isValid = validateCurrentStep();

        // 입력 다 해야 다음 단계로 넘어갈 수 있음
        if (!isValid) {
            return;
        }

        setCurrentStep((step) => Math.min(step + 1, SIGNUP_STEPS.length - 1));
    }

    // 이전 단계로 돌아가는 함수
    function handlePrevStep() {
        setErrorMessage("");
        setCurrentStep((step) => Math.max(step - 1, 0));
    }

    // 전화번호 입력 시 자동 하이픈(-) 추가
    function formatPhoneNumber(value) {
        const numbers = value.replace(/\D/g, ""); // 숫자 아닌 문자들 제거

        if (numbers.length <= 3) {
            return numbers;
        }

        if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        }

        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
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

            const submitData = {
                ...formData,
                phone_number: formData.phone_number.replace(/\D/g, ""),
            };

            await registerUser(submitData);

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

    // 캡스락 눌렸는지 체크
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);
    const [focusedPasswordField, setFocusedPasswordField] = useState(""); // 비밀번호, 비밀번호 확인 같이 표시되는 거 고치기 위함

    function checkCapsLock(e, fieldName) {
        setFocusedPasswordField(fieldName);
        setIsCapsLockOn(e.getModifierState("CapsLock"));
    }

    // input에서 포커스 헤재되면 자동으로 캡스락 false로
    function resetCapsLock() {
        setFocusedPasswordField("");
        setIsCapsLockOn(false);
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

                            <div className="signup-progress">
                                {SIGNUP_STEPS.map((step, index) => (
                                    <div
                                        className={`signup-progress-step ${currentStep === index ? "active" : ""} ${currentStep > index ? "completed" : ""}`}
                                        key={step}
                                    >
                                        <span className="signup-progress-dot">{index + 1}</span>
                                        <span className="signup-progress-label">{step}</span>
                                    </div>
                                ))}
                            </div>

                            <form className="auth-form" onSubmit={handleSubmit}>
                                {errorMessage && (
                                    <p className="error-message">
                                        {errorMessage}
                                    </p>
                                )}

                                {currentStep === 0 && (
                                    <>
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

                                    </>
                                )}

                                {currentStep === 1 && (
                                    <>
                                        <div className="verification-input-row">
                                            <input
                                                className="verification-input"
                                                type="tel"
                                                maxLength={13}
                                                name="phone_number"
                                                placeholder="전화번호(-없이 숫자만 입력)"
                                                value={formData.phone_number}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        phone_number: formatPhoneNumber(e.target.value),
                                                    });
                                                    setErrorMessage("");
                                                }}
                                                required
                                            />
                                            <button className="verification-btn" type="button">
                                                인증
                                            </button>
                                        </div>

                                        <div className="verification-input-row">
                                            <input
                                                className="verification-input"
                                                type="text"
                                                name="verificationCode"
                                                placeholder="인증번호"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                required
                                            />
                                            <button className="verification-btn" type="button">
                                                확인
                                            </button>
                                        </div>
                                    </>
                                )}

                                {currentStep === 2 && (
                                    <>
                                        <input
                                            className="input-box"
                                            type="password"
                                            name="password"
                                            placeholder="비밀번호(영문, 숫자 조합으로 8자리 이상)"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedPasswordField("password")}
                                            onKeyDown={(e) => checkCapsLock(e, "password")}
                                            onKeyUp={(e) => checkCapsLock(e, "password")}
                                            onBlur={resetCapsLock}
                                            required
                                        />
                                        {focusedPasswordField === "password" && isCapsLockOn && (
                                            <p className="caps-lock-warning">
                                                *CAPS LOCK이 켜져 있습니다.
                                            </p>
                                        )}

                                        <input
                                            className="input-box"
                                            type="password"
                                            name="passwordConfirm"
                                            placeholder="비밀번호 확인"
                                            value={formData.passwordConfirm}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedPasswordField("passwordConfirm")}
                                            onKeyDown={(e) => checkCapsLock(e, "passwordConfirm")}
                                            onKeyUp={(e) => checkCapsLock(e, "passwordConfirm")}
                                            onBlur={resetCapsLock}
                                            required
                                        />
                                        {focusedPasswordField === "passwordConfirm" && isCapsLockOn && (
                                            <p className="caps-lock-warning">
                                                *CAPS LOCK이 켜져 있습니다.
                                            </p>
                                        )}

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
                                    </>
                                )}

                                <div className="signup-step-actions">
                                    {currentStep > 0 && (
                                        <button
                                            className="auth-secondary-btn"
                                            type="button"
                                            onClick={handlePrevStep}
                                            disabled={loading}
                                        >
                                            이전
                                        </button>
                                    )}

                                    {!isLastStep ? (
                                        <button
                                            className="auth-btn signup-step-btn"
                                            type="button"
                                            onClick={handleNextStep}
                                        >
                                            다음
                                        </button>
                                    ) : (
                                        <button
                                            className="auth-btn signup-step-btn"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? "회원가입 중" : "회원가입"}
                                        </button>
                                    )}
                                </div>
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
Signup;
