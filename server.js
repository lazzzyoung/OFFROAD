require('dotenv').config()
require('./udp')
const axios = require('axios');
const express = require('express')
const app = express()
const PORT = process.env.HTTP_PORT;
const cors =require('cors');


app.use(cors({
  origin: '*',
  credentials: true,
}));
// app.use(cors());

app.use(express.json());

app.listen(PORT, () => {
    console.log('OFF-ROAD 서버 실행중')
})

app.get('/',(req,res)=>{
    res.send('Hello World');
    console.log("check1")

})

app.get("/position", (req, res) => {
  if (latestPosition) {
    res.json({ x: latestPosition[0], y: latestPosition[1] });
  } else {
    res.status(404).json({ error: "위치 없음" });
  }
});

app.use('/product',require('./routes/products.js'));
app.use('/assistant', require('./routes/assistant.js'));