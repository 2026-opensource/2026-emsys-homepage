export function saveToken(token) {
    localStorage.setItem("accessToken", token);
}

export function getToken() {
    return localStorage.getItem("accessToken");
}

export function removeToken() {
    localStorage.removeItem("accessToken");
}

export function isLoggedIn() {
    return !!localStorage.getItem("accessToken");
}

//role 저장 및 조회
export function saveUserInfo(user) {
    localStorage.setItem("userInfo", JSON.stringify(user));
}

export function getUserInfo() {
    const info = localStorage.getItem("userInfo");
    return info ? JSON.parse(info) : null;
}

export function getUserRole() {
    const user = getUserInfo();
    return user?.role || null;
}

export function removeUserInfo() {
    localStorage.removeItem("userInfo");
}

let loginRequiredAlertTimer = null;
let loginRequiredAlertShown = false;

export function isAuthError(error) {
    return error?.response?.status === 401;
}

export function showLoginRequiredAlert() {
    if (!loginRequiredAlertShown) {
        loginRequiredAlertShown = true;
        alert("로그인이 필요합니다.");
    }

    clearTimeout(loginRequiredAlertTimer);
    loginRequiredAlertTimer = setTimeout(() => {
        loginRequiredAlertShown = false;
    }, 1000);
}

export function redirectToLogin(navigate) {
    removeToken();
    removeUserInfo();
    showLoginRequiredAlert();

    if (navigate) {
        navigate("/login", { replace: true });
        return;
    }

    window.location.replace("/login");
}

export function requireLogin(navigate) {
    if (isLoggedIn()) {
        return true;
    }

    redirectToLogin(navigate);
    return false;
}
