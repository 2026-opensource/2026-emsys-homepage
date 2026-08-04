// 로그인한 사용자 확인 -> 토큰 검사 -> 사용자 정보 저장
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "로그인이 필요합니다.",
            });
        }

        // Authorization: Bearer 토큰값
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "토큰이 없습니다.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.users.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                student_id: true,
                phone_number: true,
                role: true,
                status: true,
                visit_count: true,
                profile_image: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "유효하지 않은 사용자입니다.",
            });
        }

        // 다음 controller에서 req.user로 현재 로그인 사용자 정보 사용 가능
        req.user = user;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                code: "TOKEN_EXPIRED",
                message: "토큰이 만료되었습니다.\n다시 로그인 해주세요.",
            });
        }

        return res.status(401).json({
            success: false,
            message: "인증에 실패했습니다.",
        });
    }
}

async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const token = authHeader.split(" ")[1];

        if (!token || token === "null" || token === "undefined") {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.users.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                student_id: true,
                phone_number: true,
                role: true,
                status: true,
                visit_count: true,
                profile_image: true,
            },
        });

        if (user) {
            req.user = user;
        }

        return next();
    } catch (error) {
        return next();
    }
}

module.exports = {
    requireAuth,
    optionalAuth,
};
