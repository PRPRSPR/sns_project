const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('./auth');

// 일기 작성
router.post('/', async (req, res) => {
    const { email, date, memo, emotion_tag, editable_until, is_private } = req.body;

    if (!date || !memo) {
        return res.status(400).json({ message: '날짜와 내용을 입력해주세요.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO diaries (email, date, memo, emotion_tag, editable_until, is_private) VALUES (?, ?, ?, ?, ?, ?)',
            [email, date, memo, emotion_tag, editable_until, is_private]
        );

        res.status(201).json({ message: '일기 작성 성공!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 일기 목록 조회
router.get('/:email', auth, async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(`
        SELECT d.id, d.memo, d.emotion_tag, m.mediaPath AS thumbnailPath
        FROM diaries d
        LEFT JOIN media m ON d.id = m.diaryId AND m.thumbnailYn = 'Y'
        WHERE d.email = ? AND d.is_deleted = FALSE
        ORDER BY d.date DESC
      `, [email]);

        res.json({ success: true, list: rows });
    } catch (err) {
        res.status(500).json({ error: '조회 실패' });
    }
});

router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [diaryResult] = await db.query(
            `SELECT d.*, m.mediaPath AS thumbnailPath
         FROM diaries d
         LEFT JOIN media m ON d.id = m.diaryId AND m.thumbnailYn = 'Y'
         WHERE d.id = ?`,
            [id]
        );

        if (diaryResult.length === 0) {
            return res.json({ success: false, message: '일기 없음' });
        }
        const [commentResult] = await db.query(
            `SELECT c.*, u.nickname 
             FROM comments c
             JOIN users u ON c.email = u.email
             WHERE c.diary_id = ? AND c.is_deleted = false
             ORDER BY c.created_at ASC`,
            [id]
        );

        // 미디어 목록
        const [mediaResult] = await db.query(
            `SELECT * FROM media WHERE diaryId = ?`,
            [id]
        );

        res.json({
            success: true,
            detail: diaryResult[0],
            comments: commentResult,
            media: mediaResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;
