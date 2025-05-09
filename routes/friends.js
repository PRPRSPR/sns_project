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

module.exports = router;
