// Express 설정 담당
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const swaggerSpec = require("./config/swagger");
const adminRoutes = require("./routes/admin.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const eventRoutes = require("./routes/event.routes");
const financeRoutes = require("./routes/finance.routes");
const uploadRoutes = require("./routes/upload.routes");
const publicRoutes = require("./routes/introduce.routes");

const app = express();

app.use(cors({
  origin: '*',  // 프론트 주소 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 서버 정상 작동 확인용 
app.get("/", (req, res) => {
    res.send("EMSYS Backend Server is running");
});

// Swagger 문서 페이지
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 업로드 이미지
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API 라우터
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/event", eventRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/posts", postRoutes);

app.use("/api/introduce", publicRoutes);

// 에러 처리 미들웨어는 항상 마지막에 배치
app.use(errorMiddleware);

module.exports = app;