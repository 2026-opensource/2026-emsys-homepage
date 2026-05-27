require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
const xlsx = require("xlsx");
const prisma = require("../src/lib/prisma");

function generateInvitationCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
    }

    return code;
}

function normalizeStudentId(value) {
    if (value === undefined || value === null) return "";

    // 엑셀에서 학번이 숫자로 읽히는 경우 처리
    if (typeof value === "number") {
        return String(Math.trunc(value));
    }

    return String(value).trim();
}

async function createUniqueCode() {
    while (true) {
        const code = generateInvitationCode();

        const existingCode = await prisma.invitation_codes.findUnique({
            where: { code },
        });

        if (!existingCode) {
            return code;
        }
    }
}

async function main() {
    const excelPath = path.join(
        __dirname,
        "../data/2026_엠시스_명단.xlsx"
    );

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
    });

    // F열에 초대코드 헤더 추가
    // 엑셀 7행 = JS index 6
    rows[6][5] = "초대코드";

    const dataRows = rows.slice(7);

    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];

        const studentId = normalizeStudentId(row[3]); // D열: 학번
        const name = row[4] ? String(row[4]).trim() : ""; // E열: 성명

        if (!studentId || !name) {
            continue;
        }

        // 실제 rows에서의 행 번호
        // dataRows는 rows.slice(7)이므로 실제 index는 i + 7
        const originalRowIndex = i + 7;

        const existingInvitation = await prisma.invitation_codes.findFirst({
            where: {
                student_id: studentId,
            },
        });

        if (existingInvitation) {
            // 기존 초대코드도 엑셀에 써줌
            rows[originalRowIndex][5] = existingInvitation.code;

            if (existingInvitation.is_used) {
                skippedCount++;
                continue;
            }

            if (existingInvitation.name !== name) {
                await prisma.invitation_codes.update({
                    where: {
                        code: existingInvitation.code,
                    },
                    data: {
                        name,
                    },
                });

                updatedCount++;
            } else {
                skippedCount++;
            }

            continue;
        }

        const code = await createUniqueCode();

        await prisma.invitation_codes.create({
            data: {
                code,
                student_id: studentId,
                name,
                is_used: false,
            },
        });

        // 새로 생성한 초대코드를 엑셀 F열에 추가
        rows[originalRowIndex][5] = code;

        createdCount++;
    }

    // 수정된 rows를 다시 sheet로 변환
    const newSheet = xlsx.utils.aoa_to_sheet(rows);

    // 기존 첫 번째 시트를 새 시트로 교체
    workbook.Sheets[sheetName] = newSheet;

    // 원본 엑셀에 저장
    xlsx.writeFile(workbook, excelPath);

    console.log("초대코드 엑셀 import 완료");
    console.log(`생성: ${createdCount}개`);
    console.log(`수정: ${updatedCount}개`);
    console.log(`스킵: ${skippedCount}개`);
    console.log("엑셀 파일에도 초대코드를 저장했습니다.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });