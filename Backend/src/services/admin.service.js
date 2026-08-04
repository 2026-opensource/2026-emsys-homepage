const prisma = require("../lib/prisma");
const { isValidStatus } = require("../utils/validators");

async function getUsers(query) {
    const { keyword, active } = query;

    const where = {};

    if (active === "true") {
        where.is_active = true;
    }

    if (active === "false") {
        where.is_active = false;
    }

    if (keyword) {
        where.OR = [
            { name: { contains: keyword } },
            { student_id: { contains: keyword } },
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
        orderBy: { id: "asc" },
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
    const sameStatusUser = await prisma.users.findFirst({
        where: {
            id: { in: userIds },
            status,
        },
        select: { id: true },
    });

    if (sameStatusUser) {
        const error = new Error("동일한 상태로는 변경할 수 없습니다.");
        error.statusCode = 400;
        throw error;
    }

    // 졸업생으로 상태 변경 시 시간 업데이트
    const data = { status };

    if (status === "졸업생") {
        data.graduated_at = new Date();
    } else {
        data.graduated_at = null;
    }

    const result = await prisma.users.updateMany({
        where: { id: { in: userIds } },
        data,
    });

    return { count: result.count };
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
    
    const result = await prisma.users.updateMany({
        where: { id: { in: userIds } },
        data: {
            is_active: false,
            withdraw_reason: withdrawReason,
            deleted_at: new Date(),
            role: "MEMBER",
        },
    });

    return { count: result.count };
}

async function getOfficers() {
    const officers = await prisma.users.findMany({
        where: { role: "OFFICER", is_active: true },
        select: {
            id: true,
            name: true,
            student_id: true,
            role: true,
            position: true,
            profile_image: true,
        },
        orderBy: { student_id: "asc" },
    });

    return officers;
}

async function dismissOfficer(userId) {
    const targetUserId = Number(userId);

    if (!targetUserId) {
        const error = new Error("해임할 사용자의 id가 필요합니다.");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await prisma.users.findUnique({
        where: { id: targetUserId },
    });

    if (!targetUser) {
        const error = new Error("해당 사용자를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    if (!targetUser.is_active) {
        const error = new Error("비활성화된 사용자는 해임할 수 없습니다.");
        error.statusCode = 400;
        throw error;
    }

    if (targetUser.role !== "OFFICER") {
        const error = new Error("해임 대상은 임원이어야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const updatedUser = await prisma.users.update({
        where: { id: targetUserId },
        data: { role: "MEMBER", position: null },
        select: {
            id: true,
            email: true,
            name: true,
            student_id: true,
            role: true,
            status: true,
            is_active: true,
        },
    });

    return updatedUser;
}

async function appointOfficer(userId, body) {
    const targetUserId = Number(userId);
    const { position } = body;

    if (!targetUserId) {
        const error = new Error("임명할 사용자의 id가 필요합니다.");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await prisma.users.findUnique({
        where: { id: targetUserId },
    });

    if (!targetUser) {
        const error = new Error("해당 사용자를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    if (!targetUser.is_active) {
        const error = new Error("비활성화된 사용자는 임원으로 임명할 수 없습니다.");
        error.statusCode = 400;
        throw error;
    }

    if (targetUser.role !== "MEMBER") {
        const error = new Error("임명 대상은 일반 부원이어야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const updatedUser = await prisma.users.update({
        where: { id: targetUserId },
        data: { role: "OFFICER", position },
        select: {
            id: true,
            email: true,
            name: true,
            student_id: true,
            role: true,
            status: true,
            is_active: true,
        },
    });

    return updatedUser;
}

async function delegatePresident(currentUserId, body) {
    const { targetUserId, confirmText } = body;

    const targetId = Number(targetUserId);

    if (!targetId) {
        const error = new Error("위임받을 사용자의 id가 필요합니다.");
        error.statusCode = 400;
        throw error;
    }

    if (currentUserId === targetId) {
        const error = new Error("본인에게는 회장 권한을 위임할 수 없습니다.");
        error.statusCode = 400;
        throw error;
    }

    const currentPresident = await prisma.users.findUnique({
        where: { id: currentUserId },
    });

    if (!currentPresident) {
        const error = new Error("현재 회장 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    if (currentPresident.role !== "PRESIDENT") {
        const error = new Error("회장 권한이 필요합니다.");
        error.statusCode = 403;
        throw error;
    }

    const targetUser = await prisma.users.findUnique({
        where: { id: targetId },
    });

    if (!targetUser) {
        const error = new Error("위임받을 사용자를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    const expectedText = `${targetUser.name}을 회장으로 임명`;

    if (confirmText !== expectedText) {
        const error = new Error('문구를 정확히 입력해주세요.');
        error.statusCode = 400;
        throw error;
    }

    if (!targetUser.is_active) {
        const error = new Error("비활성화된 사용자에게는 회장 권한을 위임할 수 없습니다.");
        error.statusCode = 400;
        throw error;
    }

    if (targetUser.role === "PRESIDENT") {
        const error = new Error("이미 회장 권한을 가진 사용자입니다.");
        error.statusCode = 400;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        const oldPresident = await tx.users.update({
            where: { id: currentUserId },
            data: { role: "MEMBER" },
            select: {
                id: true,
                email: true,
                name: true,
                student_id: true,
                role: true,
                status: true,
                is_active: true,
            },
        });

        const newPresident = await tx.users.update({
            where: { id: targetId },
            data: { role: "PRESIDENT" },
            select: {
                id: true,
                email: true,
                name: true,
                student_id: true,
                role: true,
                status: true,
                is_active: true,
            },
        });

        return { oldPresident, newPresident };
    });

    return result;
}

module.exports = {
    getUsers,
    updateUsersStatus,
    withdrawUsers,
    getOfficers,
    dismissOfficer,
    appointOfficer,
    delegatePresident,
};
