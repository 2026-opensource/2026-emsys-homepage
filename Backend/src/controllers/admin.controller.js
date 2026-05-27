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

async function dismissOfficer(req, res, next) {
    try {
        const result = await adminService.dismissOfficer(req.params.userId);

        return res.status(200).json({
            success: true,
            message: "임원 해임이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function appointOfficer(req, res, next) {
    try {
        const result = await adminService.appointOfficer(req.params.userId);

        return res.status(200).json({
            success: true,
            message: "임원 임명이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function delegatePresident(req, res, next) {
    try {
        const result = await adminService.delegatePresident(req.user.id, req.body);

        return res.status(200).json({
            success: true,
            message: "회장 권한 위임이 완료되었습니다.",
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
    dismissOfficer,
    appointOfficer,
    delegatePresident,
};