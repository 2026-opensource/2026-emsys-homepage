const invitationService = require("../services/invitation.service");

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