function requireAdmin(req, res, next) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "로그인이 필요합니다.",
        });
    }

    if (user.role !== "OFFICER" && user.role !== "PRESIDENT") {
        return res.status(403).json({
            success: false,
            message: "관리자 권한이 필요합니다.",
        });
    }

    next();
}

function requirePresident(req, res, next) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "로그인이 필요합니다.",
        });
    }

    if (user.role !== "PRESIDENT") {
        return res.status(403).json({
            success: false,
            message: "회장 권한이 필요합니다.",
        });
    }

    next();
}

module.exports = {
    requireAdmin,
    requirePresident,
};