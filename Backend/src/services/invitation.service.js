const prisma = require("../lib/prisma");

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
        const error = new Error("일치하는 정보가 없습니다.");
        error.status = 404;
        throw error;
    }

    return invitation;
};