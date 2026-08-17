const authService = require("../services/auth.service");

// 회원가입
async function register(req, res, next) {
    try {
        const result = await authService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "회원가입이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 로그인
async function login(req, res, next) {
    try {
        const result = await authService.loginUser(req.body);

        return res.status(200).json({
            success: true,
            message: "로그인 성공",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 이메일 찾기
async function findEmail(req, res, next) {
    try {
        const result = await authService.findEmail(req.body);

        return res.status(200).json({
            success: true,
            message: "이메일 조회 성공",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 비밀번호 변경 사용자 확인
async function verifyPasswordUser(req, res, next) {
    try {
        const result = await authService.verifyPasswordUser(req.body);

        return res.status(200).json({
            success: true,
            message: "사용자 정보 확인 성공",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 비밀번호 변경
async function changePassword(req, res, next) {
    try {
        const result = await authService.changePassword(req.body);

        return res.status(200).json({
            success: true,
            message: "비밀번호가 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 마이페이지 사용자 정보 조회
async function getMe(req, res, next) {
    try {
        const result = await authService.getMe(req.user.id);

        return res.status(200).json({
            success: true,
            message: "사용자 정보 조회 성공",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 프로필 이미지 업로드
async function updateProfileImage(req, res, next) {
    try {
        const result = await authService.updateProfileImage(
            req.user.id,
            req.file
        );

        return res.status(200).json({
            success: true,
            message: "프로필 이미지가 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 프로필 이미지 기본 변경
async function resetProfileImage(req, res, next) {
    try {
        const result = await authService.resetProfileImage(req.user.id);

        return res.status(200).json({
            success: true,
            message: "기본 프로필 이미지로 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 사용자 인사말 수정
async function updateGreetingMessage(req, res, next) {
    try {
        const result = await authService.updateGreetingMessage(
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "사용자 인사말이 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    findEmail,
    verifyPasswordUser,
    changePassword,
    getMe,
    updateProfileImage,
    resetProfileImage,
    updateGreetingMessage,
};
