require('dotenv').config()
const dgram = require('dgram');
const express = require('express')
const app = express()
const server = dgram.createSocket('udp4')
const PORT = process.env.HTTP_PORT;
const udpPort = process.env.UDP_PORT;


const HOST = process.env.HOST;

app.listen(PORT, () => {
    console.log('OFF-ROAD 서버 실행중')
})

app.get('/',(req,res)=>{
    res.send('OFF-ROAD 잘 돌아가는중임 ㅇㅇ')
})

server.bind(udpPort, HOST)

server.on('listening', ()=>{
    const address = server.address();
    console.log(`UDP 서버가 해당 IP와 포트에서 실행 중 : ${address.address} : ${address.port}`)
})

server.on('message', (msg, rinfo) => {
    const raw = msg.toString().trim(); 
  
    try {
      const data = JSON.parse(raw);
      console.log(`송신자 정보 ${rinfo.address} : ${rinfo.port}`);
      console.log(`Anchor : ${data.Anchor}, Range : ${data.Range}`);
    } catch (err) {
      console.error('Parsing 실패', err.message);
      console.log('원본 문자열:', raw); 
    }
  });