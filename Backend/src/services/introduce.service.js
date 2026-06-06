const prisma = require("../lib/prisma");

// 임원 정보 가져 옴
async function getExecutives() {
    const executives = await prisma.users.findMany({
        where: {
            role: { in: ["OFFICER", "PRESIDENT"] },
            is_active: true,
        },
        select: {
            name: true,
            role: true,
            position: true,
        },
        orderBy: [
            { role: "desc" },      
            { student_id: "asc" },
        ],
    });

    return executives;
}

module.exports = { getExecutives };