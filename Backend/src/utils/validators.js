function isValidPassword(password) {
    // 영문 최소 1개, 숫자 최소 1개, 전체 8자 이상
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function isValidStatus(status) {
    const allowedStatus = ["재학생", "휴학생", "졸업생"];
    return allowedStatus.includes(status);
}

function isValidBoardType(board_type) {
    const validBoardTypes = ["COMMUNITY", "GALLERY", "ARCHIVE"];
    return validBoardTypes.includes(board_type);
}

function isValidCommunityCategory(category) {
    const validCategories = ["notice", "free", "qna", "recruit"];
    return validCategories.includes(category);
}

function isValidGalleryCategory(category) {
    const validCategories = ["activity"];
    return validCategories.includes(category);
}

function isValidArchiveCategory(category) {
    const validCategories = ["study", "class", "project", "contest"];
    return validCategories.includes(category);
}

module.exports = {
    isValidPassword,
    isValidStatus,
    isValidBoardType,
    isValidCommunityCategory,
    isValidGalleryCategory,
    isValidArchiveCategory,
};