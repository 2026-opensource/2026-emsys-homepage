const adminService = require("../services/admin.service");

async function adminTest(req, res, next) {
    try {
        return res.status(200).json({
            success: true,
            message: "관리자 권한 확인 성공",
            data: {
                user: req.user,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function getUsers(req, res, next) {
    try {
        const result = await adminService.getUsers(req.query);

        return res.status(200).json({
            success: true,
            message: "부원 목록 조회 성공",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function updateUsersStatus(req, res, next) {
    try {
        const result = await adminService.updateUsersStatus(req.body);

        return res.status(200).json({
            success: true,
            message: "부원 학적 상태가 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function withdrawUsers(req, res, next) {
    try {
        const result = await adminService.withdrawUsers(req.body);

        return res.status(200).json({
            success: true,
            message: "부원 탈퇴 처리가 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    adminTest,
    getUsers,
    updateUsersStatus,
    withdrawUsers,
};