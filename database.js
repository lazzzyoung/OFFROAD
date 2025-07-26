require('dotenv').config()

const { MongoClient } = require('mongodb')
const url = process.env.DB_URL

let connectDB = new MongoClient(url).connect()

// 다른 파일에서 connect DB 로 사용하기위해 추출 명령어
module.exports = connectDB 

