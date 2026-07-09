const bcrypt = require("bcrypt"); //  비밀번호 암호화, 비교
const prisma = require("../lib/prisma");
const { isValidPassword, isValidStatus, isValidPhoneNumber } = require("../utils/validators");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

async function registerUser(body) {
    const {
        email,
        password,
        passwordConfirm,
        name,
        student_id,
        phone_number,
        status,
        invitationCode,
    } = body;

    // 필수값 검사
    if (
        !email ||
        !password ||
        !passwordConfirm ||
        !name ||
        !student_id ||
        !phone_number ||
        !status ||
        !invitationCode
    ) {
        const error = new Error("모든 필드를 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    // 이메일 중복 검사
    const existingEmailUser = await prisma.users.findUnique({
        where: { email },
    });

    if (existingEmailUser) {
        const error = new Error("이미 사용 중인 아이디(이메일)입니다.");
        error.statusCode = 409;
        throw error;
    }

    // 비밀번호 규칙 검사
    if (!isValidPassword(password)) {
        const error = new Error("비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    // 비밀번호 확인 검사
    if (password !== passwordConfirm) {
        const error = new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        error.statusCode = 400;
        throw error;
    }

    // 전화번호 규칙 검사
    if (!isValidPhoneNumber(phone_number)) {
        const error = new Error("전화번호는 11자 이상이어야 합니다.");
        error.statusCode = 400;
        throw error;
    }


    // 학적 상태 검사
    if (!isValidStatus(status)) {
        const error = new Error("학적 상태는 재학생, 휴학생, 졸업생 중 하나여야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    // 학번 중복 검사
    const existingStudentUser = await prisma.users.findUnique({
        where: { student_id },
    });

    if (existingStudentUser) {
        const error = new Error("이미 사용 중인 학번입니다.");
        error.statusCode = 409;
        throw error;
    }

    // 초대코드 검증
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

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 회원 생성 + 초대코드 사용 처리
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

    const updatedUser = await prisma.users.update({
        where: { id: user.id },
        data: {
            visit_count: {
                increment: 1,
            },
        },
    });

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

async function findEmail(body) {
    const { name, student_id } = body;

    if (!name || !student_id) {
        const error = new Error("이름과 학번을 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.users.findFirst({
        where: {
            name,
            student_id,
            is_active: true,
        },
        select: {
            email: true,
        },
    });

    if (!user) {
        const error = new Error("일치하는 사용자 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    return {
        email: user.email,
    };
}

async function verifyPasswordUser(body) {
    const { name, student_id, email } = body;

    if (!name || !student_id || !email) {
        const error = new Error("이름, 학번, 이메일을 모두 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.users.findFirst({
        where: {
            name,
            student_id,
            email,
            is_active: true,
        },
        select: {
            id: true,
            email: true,
        },
    });

    if (!user) {
        const error = new Error("입력한 사용자 정보가 일치하지 않습니다.");
        error.statusCode = 404;
        throw error;
    }

    const resetToken = jwt.sign(
        {
            id: user.id,
            type: "PASSWORD_RESET",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10m",
        }
    );

    return {
        resetToken,
    };
}

async function changePassword(body) {
    const { resetToken, newPassword, newPasswordConfirm } = body;

    if (!resetToken || !newPassword || !newPasswordConfirm) {
        const error = new Error("모든 필드를 입력해야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    if (!isValidPassword(newPassword)) {
        const error = new Error("비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.");
        error.statusCode = 400;
        throw error;
    }

    if (newPassword !== newPasswordConfirm) {
        const error = new Error("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        error.statusCode = 400;
        throw error;
    }

    let decoded;

    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
        const customError = new Error("비밀번호 변경 인증 시간이 만료되었거나 유효하지 않습니다.");
        customError.statusCode = 401;
        throw customError;
    }

    if (decoded.type !== "PASSWORD_RESET") {
        const error = new Error("유효하지 않은 비밀번호 변경 요청입니다.");
        error.statusCode = 401;
        throw error;
    }

    const user = await prisma.users.findUnique({
        where: {
            id: decoded.id,
        },
    });

    if (!user || !user.is_active) {
        const error = new Error("비밀번호를 변경할 수 없는 계정입니다.");
        error.statusCode = 403;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
        },
    });

    return {
        id: user.id,
        email: user.email,
    };
}

async function getMe(userId) {
    // users 테이블에서 현재 로그인한 사용자 기본 정보 조회
    // 비밀번호는 프론트로 보내면 안 되므로 select에 넣지 않음
    const user = await prisma.users.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            name: true,
            student_id: true,
            role: true,
            status: true,
            profile_image: true,
            visit_count: true,
            created_at: true,
        },
    });

    if (!user) {
        const error = new Error("사용자 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    // 내가 작성한 글 수
    // posts 테이블에서 author_id가 현재 사용자 id인 글 개수를 가져옴
    const postCount = await prisma.posts.count({
        where: {
            author_id: userId,
        },
    });

    // 내가 작성한 댓글 수
    // comments 테이블에서 author_id가 현재 사용자 id인 댓글 개수를 가져옴
    const commentCount = await prisma.comments.count({
        where: {
            author_id: userId,
        },
    });

    // 내가 좋아요한 글 수
    // post_likes 테이블에서 user_id가 현재 사용자 id인 좋아요 개수를 가져옴
    const likedPostCount = await prisma.post_likes.count({
        where: {
            user_id: userId,
        },
    });

    return {
        ...user,
        post_count: postCount,
        comment_count: commentCount,
        liked_post_count: likedPostCount,
    };
}

async function updateProfileImage(userId, file) {
    if (!file || !file.filename) {
        const error = new Error("업로드된 이미지 파일 정보가 올바르지 않습니다.");
        error.statusCode = 400;
        throw error; 
}

    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            profile_image: true,
        },
    });

    if (!user) {
        const error = new Error("사용자 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    // 기존 프로필 이미지가 있으면 삭제
    if (user.profile_image) {
        const oldImagePath = path.join(
            __dirname,
            "../../",
            user.profile_image
        );

        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    const imagePath = `/uploads/profile-images/${file.filename}`;

    const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
            profile_image: imagePath,
        },
        select: {
            id: true,
            email: true,
            name: true,
            student_id: true,
            role: true,
            status: true,
            profile_image: true,
            visit_count: true,
        },
    });

    return updatedUser;
}

async function resetProfileImage(userId) {
    // 현재 사용자의 기존 프로필 이미지 경로 조회
    const user = await prisma.users.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            profile_image: true,
        },
    });

    if (!user) {
        const error = new Error("사용자 정보를 찾을 수 없습니다.");
        error.statusCode = 404;
        throw error;
    }

    // 기존 프로필 이미지가 있으면 실제 파일 삭제
    if (user.profile_image) {
        const oldImagePath = path.join(
            __dirname,
            "../../",
            user.profile_image.replace(/^\/+/, "")
        );

        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    // DB의 profile_image 값을 null로 변경
    const updatedUser = await prisma.users.update({
        where: {
            id: userId,
        },
        data: {
            profile_image: null,
        },
        select: {
            id: true,
            email: true,
            name: true,
            student_id: true,
            role: true,
            status: true,
            profile_image: true,
            visit_count: true,
        },
    });

    return updatedUser;
}

module.exports = {
    registerUser,
    loginUser,
    findEmail,
    verifyPasswordUser,
    changePassword,
    getMe,
    updateProfileImage,
    resetProfileImage,
};
