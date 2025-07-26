require('dotenv').config()
const express = require('express');
const router = express.Router();
let connectDB = require('../database.js')

let db;
connectDB.then((client) => {
    db = client.db(process.env.DB_NAME); 
}).catch((err) => {
    console.error("Database connection failed:", err);
    throw { status: 500, message: "Database connection failed" };
});

// 전체 상품 목록
router.get('/', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();
        console.log(products);
        res.status(200).json(products);
        
      } catch (err) {
        res.status(500).json({ error: '상품 불러오기 실패' });
      }
    });

// 상품 검색 (이름 기반)
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.q;
    
        if (!keyword) {
          return res.status(400).json({ error: '검색어를 입력해주세요' });
        }
    
        const products = await db
          .collection('products')
          .find({ name: { $regex: keyword, $options: 'i' } }) // 대소문자 구분 X
          .toArray();
    
        res.json(products);
      } catch (err) {
        res.status(500).json({ error: '상품 검색 실패' });
      }
    });

// 특정 위치의 상품들
router.get('/location/:loc', async (req, res) => {
    try {
      const location = req.params.loc;
      const products = await db.collection('products').find({ location }).toArray();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: '해당 위치 상품 조회 실패' });
    }
  });
  

// 상품 하나 조회
router.get('/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const product = await db
        .collection('products')
        .findOne({ _id: new ObjectId(id) });
  
      if (!product) {
        return res.status(404).json({ error: '해당 상품 없음' });
      }
  
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: '상품 조회 실패' });
    }
  });



module.exports = router;