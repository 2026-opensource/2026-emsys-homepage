function isValidPassword(password) {
    // 영문 최소 1개, 숫자 최소 1개, 전체 8자 이상
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function isValidStatus(status) {
    const allowedStatus = ["재학생", "휴학생", "졸업생"];
    return allowedStatus.includes(status);
}

module.exports = {
    isValidPassword,
    isValidStatus,
};