// server.js
require('dotenv').config();
const express = require('express');
const dgram = require('dgram');
const { trilaterate } = require('./triangulate');
const cors = require('cors');

const app = express();
const PORT = process.env.HTTP_PORT;
const udpPort = process.env.UDP_PORT;
const HOST = process.env.HOST;

let latestPosition = null;

app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// ================== HTTP 서버 ================== //
app.listen(PORT, () => {
  console.log(`✅ OFF-ROAD HTTP 서버 실행 중 : http://localhost:${PORT}`);
  console.log(`👉 HTTP_PORT=${PORT}, UDP_PORT=${udpPort}, HOST=${HOST}`);
});

app.get('/', (req, res) => {
  console.log("📡 / 요청 받음");
  res.send('OFF-ROAD 서버 잘 돌아가는 중임 ㅎㅇ');
});

app.get('/position', (req, res) => {
  console.log("📡 /position 요청 받음, latestPosition =", latestPosition);
  if (latestPosition) {
    res.json({ x: latestPosition[0], y: latestPosition[1] });
  } else {
    console.log("❌ latestPosition 없음 → 404 반환");
    res.status(404).json({ error: "위치 없음" });
  }
});

app.use('/product', require('./routes/products.js'));
app.use('/assistant', require('./routes/assistant.js'));

// ================== UDP 서버 ================== //
const udpServer = dgram.createSocket('udp4');
let rangeA1 = null, rangeA2 = null, rangeA3 = null;

udpServer.bind(udpPort, HOST);

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`✅ UDP 서버 실행 중 : ${address.address}:${address.port}`);
});

udpServer.on('message', (msg) => {
  const raw = msg.toString().trim();
  console.log("📩 UDP 메시지 수신:", raw);

  try {
    const data = JSON.parse(raw);
    const range = data.Range;
    const anchor = data.Anchor;

    console.log(`➡️ 파싱 성공: Anchor=${anchor}, Range=${range}`);

    switch (anchor) {
      case '1784':
        rangeA1 = range;
        break;
      case '1785':
        rangeA2 = range;
        break;
      case '1786':
        rangeA3 = range;
        break;
      default:
        console.log('⚠️ 알 수 없는 Anchor:', anchor);
    }

    // ✅ 모든 값이 들어왔을 때 계산
    if (rangeA1 !== null && rangeA2 !== null && rangeA3 !== null) {
      try {
        console.log(`📊 trilaterate 계산 시작: A1=${rangeA1}, A2=${rangeA2}, A3=${rangeA3}`);
        const result = trilaterate(
          [0, 0, rangeA1],
          [0, 2.5, rangeA2],
          [2.5, 0, rangeA3]
        );
        latestPosition = result;
        console.log('✅ 계산된 현재 위치:', result);

        // 초기화
        rangeA1 = rangeA2 = rangeA3 = null;
      } catch (err) {
        console.error("❌ 삼변측량 계산 실패:", err.message);
      }
    }
  } catch (err) {
    console.error('❌ Parsing 실패:', err.message);
    console.log('원본 문자열:', raw);
  }
});