function errorMiddleware(error, req, res, next) {
    const statusCode = error.statusCode || 500;

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