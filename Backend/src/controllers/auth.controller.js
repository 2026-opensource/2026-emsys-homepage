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

module.exports = {
    register,
};