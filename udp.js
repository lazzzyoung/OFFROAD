require('dotenv').config()
const { trilaterate } = require('./triangulate');
const dgram = require('dgram');
const server = dgram.createSocket('udp4')
const udpPort = process.env.UDP_PORT;
const HOST = process.env.HOST;

let rangeA1 = null;
let rangeA2 = null;
let rangeA3 = null;

server.bind(udpPort, HOST)

server.on('listening', ()=>{
    const address = server.address();
    console.log(`UDP 서버 실행 중 : ${address.address} : ${address.port}`)
})

server.on('message', (msg) => {
  
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
      
      if (rangeA1!=null && rangeA2!=null && rangeA3!=null) {
        console.log('모든 Anchor의 Range 수신 완료');
        try {
          // 일단 앵커위치는 임의로 설정해놨음
          const result = trilaterate(
            [3, 1.5, rangeA1],
            [0, 1.5, rangeA2],
            [0, 0 , rangeA3] 
          );
          console.log('계산된 현재 위치:', result);
          rangeA1 = rangeA2 = rangeA3 = null;
        } catch (err) {
          console.error(err.message);
        }
    }

    } catch (err) {
      console.error('Parsing 실패', err.message);
      console.log('원본 문자열:', raw); 
    }
   
  }
);




//
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.HTTP_PORT;

// 라우팅 설정
app.get('/', (req, res) => {
  res.send('OFF-ROAD 잘 돌아가는중임 ㅇㅇ');
});

// UDP 소켓 실행 (모듈 import해서 실행)
require('./udp');

// 서버 시작
app.listen(PORT, () => {
  console.log(`HTTP 서버 실행 중 : http://localhost:${PORT}`);
});
