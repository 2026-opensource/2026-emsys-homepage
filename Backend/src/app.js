// Express 설정 담당
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const swaggerSpec = require("./config/swagger");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// 서버 정상 작동 확인용 
app.get("/", (req, res) => {
    res.send("EMSYS Backend Server is running");
});

// Swagger 문서 페이지
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API 라우터
app.use("/api/auth", authRoutes);

// 에러 처리 미들웨어
app.use(errorMiddleware);

module.exports = app;