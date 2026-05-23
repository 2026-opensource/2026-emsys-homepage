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

module.exports = {
    register,
    login,
};