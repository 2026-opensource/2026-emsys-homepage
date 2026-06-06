const prisma = require('../lib/prisma');
const adminService = require("../services/admin.service");

// 관리자 권한 확인
async function adminTest(req, res, next) {
    try {
        return res.status(200).json({
            success: true,
            message: "관리자 권한 확인 성공",
            data: {
                user: req.user,
            },
        });
    } catch (error) {
        next(error);
    }
}

// 부원 전체 목록
async function getUsers(req, res, next) {
    try {
        const result = await adminService.getUsers(req.query);

        return res.status(200).json({
            success: true,
            message: "부원 목록 조회 성공",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 부원 상태 변경
async function updateUsersStatus(req, res, next) {
    try {
        const result = await adminService.updateUsersStatus(req.body);

        return res.status(200).json({
            success: true,
            message: "부원 학적 상태가 변경되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 회원 탈퇴 처리
async function withdrawUsers(req, res, next) {
    try {
        const result = await adminService.withdrawUsers(req.body);

        return res.status(200).json({
            success: true,
            message: "부원 탈퇴 처리가 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 임원 정보 
async function getOfficers(req, res, next) {
    try {

        const result = await adminService.getOfficers();

        return res.status(200).json({
            success: true,
            message: "임원 목록 조회 성공",
            data: result,
        });

    } catch (error) {
        next(error);
    }
}

// 임원 해임
async function dismissOfficer(req, res, next) {
    try {
        const result = await adminService.dismissOfficer(req.params.userId);

        return res.status(200).json({
            success: true,
            message: "임원 해임이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 임원 임명
async function appointOfficer(req, res, next) {
    try {
        const result = await adminService.appointOfficer(req.params.userId, req.body);

        return res.status(200).json({
            success: true,
            message: "임원 임명이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 회장 권한 위임
async function delegatePresident(req, res, next) {
    try {
        const result = await adminService.delegatePresident(req.user.id, req.body);

        return res.status(200).json({
            success: true,
            message: "회장 권한 위임이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 모든 게시글(모든 게시판의 게시글) 불러오기
async function getAllPosts(req, res) {
    try {
        const { category, search, page = 1, limit = 5 } = req.query;

        const where = {};

        if (category && category !== '') {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } }
            ];
        }

        const totalCount = await prisma.posts.count({ where });

        const posts = await prisma.posts.findMany({
            where,
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            orderBy: { created_at: 'desc' },
            include: {
                users: {
                    select: { name: true, student_id: true, status: true, is_active: true, }
                },
                _count: {
                    select: { comments: true, post_likes: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("게시글 전체 조회 에러:", error);
        res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
};


module.exports = {
    adminTest,
    getUsers,
    updateUsersStatus,
    withdrawUsers,
    getOfficers,
    dismissOfficer,
    appointOfficer,
    delegatePresident,
    getAllPosts,
};