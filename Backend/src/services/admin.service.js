const prisma = require("../lib/prisma");
const { isValidStatus } = require("../utils/validators");

async function getUsers(query) {
    const { keyword, active } = query;

    const where = {};

    // active=true 또는 active=false 필터
    if (active === "true") {
        where.is_active = true;
    }

    if (active === "false") {
        where.is_active = false;
    }

    // 이름 또는 학번 검색
    if (keyword) {
        where.OR = [
            {
                name: {
                    contains: keyword,
                },
            },
            {
                student_id: {
                    contains: keyword,
                },
            },
        ];
    }

    const users = await prisma.users.findMany({
        where,
        select: {
            id: true,
            email: true,
            name: true,
            student_id: true,
            role: true,
            status: true,
            is_active: true,
            withdraw_reason: true,
            deleted_at: true,
            created_at: true,
        },
        orderBy: {
            id: "asc",
        },
    });

    return users;
}

async function updateUsersStatus(body) {
    const { userIds, status } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        const error = new Error("상태를 변경할 부원을 하나 이상 선택해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    if (!isValidStatus(status)) {
        const error = new Error("학적 상태는 재학생, 휴학생, 졸업생 중 하나여야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const result = await prisma.users.updateMany({
        where: {
            id: {
                in: userIds,
            },
        },
        data: {
            status,
        },
    });

    return {
        count: result.count,
    };
}

async function withdrawUsers(body) {
    const { userIds, withdrawReason } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        const error = new Error("탈퇴 처리할 부원을 하나 이상 선택해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    if (!withdrawReason) {
        const error = new Error("탈퇴 또는 제명 사유를 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const allowedReasons = ["자진 탈퇴", "제명", "동아리 이동", "기타"];

    if (!allowedReasons.includes(withdrawReason)) {
        const error = new Error("탈퇴 사유는 자진 탈퇴, 제명, 동아리 이동, 기타 중 하나여야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const result = await prisma.users.updateMany({
        where: {
            id: {
                in: userIds,
            },
        },
        data: {
            is_active: false,
            withdraw_reason: withdrawReason,
            deleted_at: new Date(),
            role: "MEMBER",
        },
    });

    return {
        count: result.count,
    };
}

module.exports = {
    getUsers,
    updateUsersStatus,
    withdrawUsers,
};