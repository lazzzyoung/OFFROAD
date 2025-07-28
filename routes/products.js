require('dotenv').config()
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
let connectDB = require('../database.js')

let db;
connectDB
  .then((client) => {
    db = client.db(process.env.DB_NAME);
  })
  .catch((err) => {
    console.error("❌ DB 연결 실패:", err);
    process.exit(1); // 그냥 서버 종료
  });

// 전체 상품 목록
router.get('/', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();

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
        
        console.log("상품 불러오기 성공");
        res.status(200).json(products);
      } catch (err) {
        res.status(500).json({ error: '상품 검색 실패' });
      }
    });

// 장바구니에 담긴 상품만 조회
router.get('/cart', async (req, res) => {
  try {
    const cartItems = await db
      .collection('products')
      .find({ status: 'in_cart' })
      .toArray();

    res.status(200).json(cartItems);
  } catch (err) {
    res.status(500).json({ error: '장바구니 상품 조회 실패' });
  }
});

// routes/product.js



router.post('/cart/add/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: { status: "in_cart" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: '상품 장바구니에 추가됨' });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post('/cart/remove/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: { status: "available" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: '상품 장바구니에서 제거됨' });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post('/cart/clear', async (req, res) => {
  try {
    await db.collection('products').updateMany(
      { status: 'in_cart' },              
      { $set: { status: 'available' } }     
    );
    res.status(200).json({ message: '장바구니 초기화 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '장바구니 초기화 실패' });
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
 
router.get("/location/:id", async (req, res) => {
    const productId = req.params.id;
  
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "유효하지 않은 상품 ID입니다." });
    }
  
    try {
      const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
  
      if (!product) {
        return res.status(404).json({ error: "해당 상품을 찾을 수 없습니다." });
      }
  
      res.json({ location: product.location });
    } catch (err) {
      console.error("상품 위치 조회 실패:", err);
      res.status(500).json({ error: "서버 오류로 위치를 조회할 수 없습니다." });
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