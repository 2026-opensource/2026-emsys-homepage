const bcrypt = require("bcrypt"); //  비밀번호 암호화, 비교
const prisma = require("../lib/prisma");
const { isValidPassword, isValidStatus } = require("../utils/validators");
const jwt = require("jsonwebtoken");

async function registerUser(body) {
    const {
        email,
        password,
        passwordConfirm,
        name,
        student_id,
        status,
        invitationCode,
    } = body;

    // 1. 필수값 검사
    if (
        !email ||
        !password ||
        !passwordConfirm ||
        !name ||
        !student_id ||
        !status ||
        !invitationCode
    ) {
        const error = new Error("모든 필드를 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    // 2. 학적 상태 검사
    if (!isValidStatus(status)) {
        const error = new Error("학적 상태는 재학생, 휴학생, 졸업생 중 하나여야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    // 3. 비밀번호 규칙 검사
    if (!isValidPassword(password)) {
        const error = new Error("비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    // 4. 비밀번호 확인 검사
    if (password !== passwordConfirm) {
        const error = new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        error.statusCode = 400;
        throw error;
    }

    // 5. 이메일 중복 검사
    const existingEmailUser = await prisma.users.findUnique({
        where: { email },
    });

    if (existingEmailUser) {
        const error = new Error("이미 사용 중인 이메일입니다.");
        error.statusCode = 409;
        throw error;
    }

    // 6. 학번 중복 검사
    const existingStudentUser = await prisma.users.findUnique({
        where: { student_id },
    });

    if (existingStudentUser) {
        const error = new Error("이미 사용 중인 학번입니다.");
        error.statusCode = 409;
        throw error;
    }

    // 7. 초대코드 검증
    const invitation = await prisma.invitation_codes.findUnique({
        where: { code: invitationCode },
    });

    if (!invitation) {
        const error = new Error("유효하지 않은 초대코드입니다.");
        error.statusCode = 400;
        throw error;
    }

    if (invitation.is_used) {
        const error = new Error("이미 사용된 초대코드입니다.");
        error.statusCode = 400;
        throw error;
    }

    // 선택 사항:
    // 초대코드에 등록된 학번/이름과 회원가입 입력값이 일치하는지 검사
    if (invitation.student_id !== student_id || invitation.name !== name) {
        const error = new Error("초대코드 정보와 이름 또는 학번이 일치하지 않습니다.");
        error.statusCode = 400;
        throw error;
    }

    // 8. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. 회원 생성 + 초대코드 사용 처리
    // 둘 중 하나만 성공하고 하나는 실패하는 문제를 막기 위해 transaction 사용
    const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
            data: {
                email,
                password: hashedPassword,
                name,
                student_id,
                status,
                role: "MEMBER",
            },
            select: {
                id: true,
                email: true,
                name: true,
                student_id: true,
                role: true,
                status: true,
                created_at: true,
            },
        });

        await tx.invitation_codes.update({
            where: { code: invitationCode },
            data: {
                is_used: true,
                used_at: new Date(),
            },
        });

        return newUser;
    });

    return result;
}

async function loginUser(body) {
    const { email, password } = body;

    if (!email || !password) {
        const error = new Error("이메일과 비밀번호를 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.users.findUnique({
        where: { email },
    });

    if (!user) {
        const error = new Error("아이디 또는 비밀번호를 확인하세요.");
        error.statusCode = 401;
        throw error;
    }

    if (!user.is_active) {
        const error = new Error("탈퇴 또는 비활성화된 계정입니다.");
        error.statusCode = 403;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error = new Error("아이디 또는 비밀번호를 확인하세요.");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h",
        }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            student_id: user.student_id,
            role: user.role,
            status: user.status,
        },
    };
}

module.exports = {
    registerUser,
    loginUser,
};