const memberService = require("../services/member.service");

// 회원(초대코드) 목록 조회
async function getInvitationMembers(req, res, next) {
    try {
        const result = await memberService.getInvitationMembers(req.query);

        return res.status(200).json({
            success: true,
            message: "회원 목록 조회 성공",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

// 회원 신규 등록
async function createInvitationMember(req, res, next) {
    try {
        const result = await memberService.createInvitationMember(req.body);

        return res.status(201).json({
            success: true,
            message: "회원이 등록되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 회원 정보 수정
async function updateInvitationMember(req, res, next) {
    try {
        const result = await memberService.updateInvitationMember(req.params.id, req.body);

        return res.status(200).json({
            success: true,
            message: "회원 정보가 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 회원 삭제
async function deleteInvitationMember(req, res, next) {
    try {
        const result = await memberService.deleteInvitationMember(req.params.id);

        return res.status(200).json({
            success: true,
            message: "회원이 삭제되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 엑셀 업로드 (일괄 등록)
async function uploadInvitationExcel(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "업로드할 엑셀 파일이 필요합니다.",
            });
        }

        const result = await memberService.uploadInvitationExcel(req.file.buffer);

        return res.status(200).json({
            success: true,
            message: "엑셀 업로드가 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getInvitationMembers,
    createInvitationMember,
    updateInvitationMember,
    deleteInvitationMember,
    uploadInvitationExcel,
};