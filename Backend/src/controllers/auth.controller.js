const authService = require("../services/auth.service");

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

module.exports = {
    register,
    login,
    findEmail,
    verifyPasswordUser,
    changePassword,
    getMe,
    updateProfileImage,
    resetProfileImage,
};
