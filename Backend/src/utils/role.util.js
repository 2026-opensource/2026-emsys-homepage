// 임원 + 회장 (관리자) 확인
function isAdmin(role) {
    return role === "OFFICER" || role === "PRESIDENT";
}

// 회장 확인
function isPresident(role) {
    return role === "PRESIDENT";
}

// 본인 확인
function isOwner(ownerId, userId) {
    return Number(ownerId) === Number(userId);
}

module.exports = {
    isAdmin,
    isPresident,
    isOwner,
};