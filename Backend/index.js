// backend/index.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 테스트용 기본 주소 (http://localhost:3000/)
app.get('/', (req, res) => {
  res.send('🚀 백엔드 서버가 정상적으로 가동 중입니다!');
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🟢 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`=============================================`);
});