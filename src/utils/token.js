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