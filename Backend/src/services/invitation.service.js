const prisma = require("../lib/prisma");

const SIGNUP_FAILED_MESSAGE =
    "입력 정보가 이미 사용 중이거나 초대 정보와 일치하지 않습니다.\n다시 확인하거나 관리자에게 문의해 주세요.";

exports.getInvitationCode = async ({ student_id, name }) => {
    const invitation = await prisma.invitation_codes.findFirst({
        where: {
            student_id: String(student_id).trim(),
            name: String(name).trim(),
        },
        select: {
            code: true,
            is_used: true,
        },
    });

    if (!invitation) {
        const error = new Error(SIGNUP_FAILED_MESSAGE);
        error.statusCode = 404;
        throw error;
    }

    return invitation;
};
