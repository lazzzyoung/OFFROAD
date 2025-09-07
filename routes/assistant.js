require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/', async (req, res) => {
  const { question } = req.body;
  // console.log("질문 들어옴:", question);

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${question}\n\n답변은 마크다운 형식 없이 순수 텍스트로만 해줘. 별표, 굵게, 리스트 등 마크다운 문법은 쓰지 마.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ result: aiResponse || '응답이 없어요.' });
  } catch (error) {
    // console.error('Gemini 호출 실패:', error.message);
    // console.error('상세 오류:', error.response?.data || error);
    res.status(500).json({ error: 'AI 응답 실패' });  
  }
});

module.exports = router;