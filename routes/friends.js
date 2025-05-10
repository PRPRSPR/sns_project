const express = require('express');
const router = express.Router();
const db = require('../db');

// 친구 목록 조회
router.get('/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT u.email, u.nickname, u.profile_image, u.bio
            FROM friends f
            JOIN users u ON f.friend_email = u.email
            WHERE f.user_email = ?`,
            [email]
        );

        res.json({ success: true, friends: rows });
    } catch (err) {
        console.error('친구 목록 조회 실패:', err);
        res.status(500).json({ success: false, message: '친구 목록 조회 실패' });
    }
});

router.get('/count/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT COUNT(*) AS count
            FROM friends f
            WHERE f.user_email = ?`,
            [email]
        );

        res.json({ success: true, count: rows[0].count });
    } catch (err) {
        console.error('친구 수 조회 실패:', err);
        res.status(500).json({ success: false, message: '친구 수 조회 실패' });
    }
});

// 친구 추천
router.get('/recommend', async (req, res) => {
    const { email, limit } = req.query;
    console.log("email >> ",email," // limit >> ",limit);
    try {
        const [rows] = await db.query(`
            SELECT email, nickname, profile_image, bio 
            FROM users
            WHERE email != ?
            AND email NOT IN (
                SELECT friend_email FROM friends WHERE user_email = ?
            )
            ORDER BY RAND()
            LIMIT ?
        `, [email, email, parseInt(limit)]);
            console.log(rows);
        res.json({ success: true, recommend: rows });
    } catch (err) {
        console.error('유저 추천 실패:', err);
        res.status(500).json({ success: false, message: '추천 실패' });
    }
});

// 친구 요청
router.post('/request', async (req, res) => {
    const { userEmail, friendEmail } = req.body;

    try {
        // 이미 친구가 아닌지 확인
        const [existingFriendship] = await db.query(`
            SELECT * FROM friends 
            WHERE user_email = ? AND friend_email = ?`,
            [userEmail, friendEmail]
        );

        if (existingFriendship.length > 0) {
            return res.status(400).json({ success: false, message: '이미 친구입니다.' });
        }

        // 친구 요청을 보낸다.
        await db.query(`
            INSERT INTO friends (user_email, friend_email, status)
            VALUES (?, ?, 'pending')`,
            [userEmail, friendEmail]
        );

        res.json({ success: true, message: '친구 요청을 보냈습니다.' });
    } catch (err) {
        console.error('친구 요청 보내기 실패:', err);
        res.status(500).json({ success: false, message: '친구 요청 보내기 실패' });
    }
});

module.exports = router;
