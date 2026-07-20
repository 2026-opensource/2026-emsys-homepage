const invitationService = require("../services/invitation.service");

const SIGNUP_FAILED_MESSAGE =
    "입력 정보가 이미 사용 중이거나 초대 정보와 일치하지 않습니다.\n다시 확인하거나 관리자에게 문의해 주세요.";

exports.getInvitationCode = async (req, res, next) => {
    try {
        const { student_id, name } = req.query;

        if (!student_id || !name) {
            return res.status(400).json({
                success: false,
                message: "학번과 이름을 입력해주세요.",
            });
        }

        const result = await invitationService.getInvitationCode({ student_id, name });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
