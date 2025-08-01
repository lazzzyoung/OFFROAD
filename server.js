// server.js
require('dotenv').config();
const express = require('express');
const dgram = require('dgram');
const { trilaterate } = require('./triangulate'); // 삼변측량 계산 함수
const cors = require('cors');

const app = express();
const PORT = process.env.HTTP_PORT;
const udpPort = process.env.UDP_PORT;
const HOST = process.env.HOST;


let latestPosition = null;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());


app.listen(PORT, () => {
  console.log(`OFF-ROAD HTTP 서버 실행 중 : http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('OFF-ROAD 서버 잘 돌아가는 중임 ㅎㅇ');
});


app.get('/position', (req, res) => {
  if (latestPosition) {
    res.json({ x: latestPosition[0], y: latestPosition[1] });
  } else {
    res.status(404).json({ error: "위치 없음" });
  }
});


app.use('/product', require('./routes/products.js'));
app.use('/assistant', require('./routes/assistant.js'));


// ========== UDP 서버 ========== //
const udpServer = dgram.createSocket('udp4');
let rangeA1 = null, rangeA2 = null, rangeA3 = null;

udpServer.bind(udpPort, HOST);

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`UDP 서버 실행 중 : ${address.address}:${address.port}`);
});

udpServer.on('message', (msg) => {
  const raw = msg.toString().trim();
  try {
    const data = JSON.parse(raw);
    const range = data.Range;
    const anchor = data.Anchor;

    switch (anchor) {
      case '1784':
        rangeA1 = range;
        console.log(`Anchor : A1, Range : ${rangeA1}`);
        break;
      case '1785':
        rangeA2 = range;
        console.log(`Anchor : A2, Range : ${rangeA2}`);
        break;
      case '1786':
        rangeA3 = range;
        console.log(`Anchor : A3, Range : ${rangeA3}`);
        break;
      default:
        console.log('알 수 없는 Anchor:', anchor);
    }

    // ✅ 세 개의 앵커 값이 모두 들어왔을 때 위치 계산
    if (rangeA1 !== null && rangeA2 !== null && rangeA3 !== null) {
      try {
        const result = trilaterate(
          [0, 0, rangeA1],
          [0, 2.5, rangeA2],
          [2.5, 0, rangeA3]
        );
        latestPosition = result;
        console.log('계산된 현재 위치:', result);

        // ✅ 다음 수신을 위해 초기화
        rangeA1 = rangeA2 = rangeA3 = null;
      } catch (err) {
        console.error("삼변측량 계산 실패:", err.message);
      }
    }
  } catch (err) {
    console.error('Parsing 실패', err.message);
    console.log('원본 문자열:', raw);
  }
});