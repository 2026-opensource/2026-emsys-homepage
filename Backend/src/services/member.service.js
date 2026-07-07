const prisma = require("../lib/prisma");
const crypto = require("crypto");
const ExcelJS = require("exceljs");

function generateCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars[crypto.randomInt(0, chars.length)];
    }
    return code;
}

async function createUniqueCode() {
    while (true) {
        const code = generateCode();
        const existing = await prisma.invitation_codes.findUnique({ where: { code } });
        if (!existing) return code;
    }
}

function normalizeStudentId(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "number") return String(Math.trunc(value));
    return String(value).trim();
}

function normalizePhone(value) {
    if (value === undefined || value === null) return "";
    return String(value).replace(/[^0-9]/g, "");
}

// 목록 조회 (검색 / 가입상태 필터 / 페이지네이션)
async function getInvitationMembers(query) {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 15;
    const { search = "", status = "all" } = query;

    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { student_id: { contains: search } },
        ];
    }

    if (status === "joined") {
        where.is_used = true;
    } else if (status === "pending") {
        where.is_used = false;
    }

    const total = await prisma.invitation_codes.count({ where });

    const data = await prisma.invitation_codes.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: "desc" },
    });

    return {
        data,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
}

// 신규 등록
async function createInvitationMember(body) {
    const name = body.name?.trim();
    const student_id = normalizeStudentId(body.student_id);
    const phone = normalizePhone(body.phone);

    if (!name || !student_id || !phone) {
        const error = new Error("이름, 학번, 전화번호를 모두 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const existing = await prisma.invitation_codes.findFirst({
        where: { student_id },
    });

    if (existing) {
        const error = new Error("이미 등록된 학번입니다.");
        error.statusCode = 409;
        throw error;
    }

    const code = await createUniqueCode();

    const created = await prisma.invitation_codes.create({
        data: { code, student_id, name, phone, is_used: false },
    });

    return created;
}

// 수정 (id를 식별자로 사용)
async function updateInvitationMember(id, body) {
    const memberId = Number(id);

    const existing = await prisma.invitation_codes.findUnique({ where: { id: memberId } });

    if (!existing) {
        const error = new Error("해당 회원 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    const name = body.name?.trim();
    const student_id = normalizeStudentId(body.student_id);
    const phone = normalizePhone(body.phone);

    if (!name || !student_id || !phone) {
        const error = new Error("이름, 학번, 전화번호를 모두 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    if (student_id !== existing.student_id) {
        const duplicated = await prisma.invitation_codes.findFirst({
            where: { student_id },
        });
        if (duplicated) {
            const error = new Error("이미 등록된 학번입니다.");
            error.statusCode = 409;
            throw error;
        }
    }

    const updated = await prisma.invitation_codes.update({
        where: { id: memberId },
        data: { name, student_id, phone },
    });

    return updated;
}

// 삭제
async function deleteInvitationMember(id) {
    const memberId = Number(id);

    const existing = await prisma.invitation_codes.findUnique({ where: { id: memberId } });

    if (!existing) {
        const error = new Error("해당 회원 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    await prisma.invitation_codes.delete({ where: { id: memberId } });

    return { success: true };
}

// 엑셀 업로드 (exceljs 사용) - 헤더 행에 '학번', '이름', '전화번호' 열이 있다고 가정
async function uploadInvitationExcel(fileBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
        const error = new Error("엑셀 시트를 찾을 수 없습니다.");
        error.statusCode = 400;
        throw error;
    }

    // 헤더 행(1행)을 읽어서 열 이름 -> 열 번호 매핑
    const headerRow = worksheet.getRow(1);
    const columnIndex = {};
    headerRow.eachCell((cell, colNumber) => {
        const header = String(cell.value ?? "").trim();
        if (header) columnIndex[header] = colNumber;
    });

    const requiredHeaders = ["학번", "이름", "전화번호"];
    const missingHeaders = requiredHeaders.filter((h) => !columnIndex[h]);

    if (missingHeaders.length > 0) {
        const error = new Error(
            `엑셀에 다음 열이 필요합니다: ${missingHeaders.join(", ")}`
        );
        error.statusCode = 400;
        throw error;
    }

    let created = 0;
    let skipped = 0;

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        const rawStudentId = row.getCell(columnIndex["학번"]).value;
        const rawName = row.getCell(columnIndex["이름"]).value;
        const rawPhone = row.getCell(columnIndex["전화번호"]).value;

        const student_id = normalizeStudentId(rawStudentId);
        const name = rawName ? String(rawName).trim() : "";
        const phone = normalizePhone(rawPhone);

        if (!student_id || !name || !phone) {
            skipped++;
            continue;
        }

        const existing = await prisma.invitation_codes.findFirst({
            where: { student_id },
        });

        if (existing) {
            skipped++;
            continue;
        }

        const code = await createUniqueCode();

        await prisma.invitation_codes.create({
            data: { code, student_id, name, phone, is_used: false },
        });

        created++;
    }

    return { created, skipped };
}

module.exports = {
    getInvitationMembers,
    createInvitationMember,
    updateInvitationMember,
    deleteInvitationMember,
    uploadInvitationExcel,
};