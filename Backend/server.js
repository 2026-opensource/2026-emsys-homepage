// backend/server.js
// src/app.js에서 만든 Express 앱을 가져와서 listen으로 실행
// 서버 실행 담당

require("dotenv").config();

const app = require("./src/app");
const { startGraduationScheduler } = require("./src/schedulers/graduation.scheduler");

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🟢 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📘 Swagger 문서: http://localhost:${PORT}/api-docs`);
  console.log(`=============================================`);

  startGraduationScheduler();
});
