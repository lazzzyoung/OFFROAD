require('dotenv').config()
require('./udp')
const express = require('express')
const app = express()
const PORT = process.env.HTTP_PORT;


app.listen(PORT, () => {
    console.log('OFF-ROAD 서버 실행중')
})

// app.get('/',(req,res)=>{
//     res.send('OFF-ROAD 잘 돌아가는중임 ㅇㅇ')
// })

