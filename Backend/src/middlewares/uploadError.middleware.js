const multer = require("multer");

function uploadErrorHandler(error, req, res, next) {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "이미지 1장당 최대 10MB까지 업로드할 수 있습니다.",
            });
        }
        
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "파일 업로드 중 오류가 발생했습니다.",
        });
    }

    next();
}

module.exports = uploadErrorHandler;