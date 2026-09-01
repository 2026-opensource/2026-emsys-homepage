function errorMiddleware(error, req, res, next) {
    // post.service.js 등 대부분의 서비스 코드는 error.status를 쓰고,
    // 일부(마이페이지 통계 등 최근 추가된 코드)는 error.statusCode를 쓰고 있어서
    // 둘 다 확인해야 의도한 상태 코드(예: 400, 403, 404)가 제대로 응답됨.
    const statusCode = error.statusCode || error.status || 500;

    console.error("에러 발생:", {
        statusCode,
        message: error.message,
        stack: error.stack,
    });

    const message =
        statusCode >= 500
            ? "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            : error.message || "요청을 처리할 수 없습니다.";

    return res.status(statusCode).json({
        success: false,
        message,
    });
}

module.exports = errorMiddleware;