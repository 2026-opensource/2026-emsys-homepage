function errorMiddleware(error, req, res, next) {
    console.error(error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "서버 내부 오류가 발생했습니다.",
    });
}

module.exports = errorMiddleware;