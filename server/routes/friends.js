const express = require('express');
const router = express.Router();
const db = require('../db');

// 친구 추천
router.get('/recommend', async (req, res) => {
    const { email, limit } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT u.email, u.nickname, u.profile_image, u.bio, 
                CASE
                    WHEN f.status = 'pending' AND f.user_email = ? THEN 'sent'
                    WHEN f.status = 'pending' AND f.friend_email = ? THEN 'received'
                    WHEN f.status = 'accepted' THEN 'friend'
                    ELSE NULL
                END AS status
            FROM users u
            LEFT JOIN friends f
                ON (f.user_email = ? AND f.friend_email = u.email)
                OR (f.friend_email = ? AND f.user_email = u.email)
            WHERE u.email != ?
            AND u.email NOT IN (
                SELECT friend_email FROM friends WHERE user_email = ?
            )
            ORDER BY RAND()
            LIMIT ?
        `, [email, email, email, email, email, email, parseInt(limit)]);
        res.json({ success: true, recommend: rows });
    } catch (err) {
        console.error('유저 추천 실패:', err);
        res.status(500).json({ success: false, message: '추천 실패' });
    }
});

router.get('/count/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT COUNT(*) AS count
            FROM friends
            WHERE user_email = ? and status = 'accepted'`,
            [email]
        );

        res.json({ success: true, count: rows[0].count });
    } catch (err) {
        console.error('친구 수 조회 실패:', err);
        res.status(500).json({ success: false, message: '친구 수 조회 실패' });
    }
});

router.get('/status/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT 
                u.email, u.nickname, u.profile_image,
                CASE
                    WHEN f.status = 'accepted' THEN 'friend'
                    WHEN f.status = 'pending' AND f.user_email = ? THEN 'sent'
                    WHEN f.status = 'pending' AND f.friend_email = ? THEN 'received'
                    ELSE 'none'
                END AS status
            FROM users u
            LEFT JOIN friends f 
                ON (f.user_email = ? AND f.friend_email = u.email) 
                OR (f.friend_email = ? AND f.user_email = u.email)
            WHERE u.email IN (
                SELECT friend_email FROM friends WHERE user_email = ?
                UNION
                SELECT user_email FROM friends WHERE friend_email = ?
            )
            AND u.email != ?
            `, [email, email, email, email, email, email, email]
        );

        res.json({ success: true, status: rows });
    } catch (err) {
        console.error('친구 상태 확인 오류:', err);
        res.status(500).json({ success: false });
    }
});

router.get('/status', async (req, res) => {
    const { user, target } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT status FROM friends WHERE user_email = ? AND friend_email = ?`,
            [user, target]
        );
        if (rows.length === 0) {
            return res.json({ success: true, status: 'none' });
        }
        res.json({ success: true, status: rows[0].status });
    } catch (err) {
        console.error('친구 상태 확인 오류:', err);
        res.status(500).json({ success: false });
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
            return res.status(400).json({ success: false });
        }

        await db.query(`
            INSERT INTO friends (user_email, friend_email, status)
            VALUES (?, ?, 'pending')`,
            [userEmail, friendEmail]
        );

        const user = await db.query(
            'SELECT nickname FROM users WHERE email = ?',
            [userEmail]
        );

        const message = `${user[0][0].nickname}님이 친구 요청을 보냈습니다.`;
        const link = `/profile/${userEmail}`;

        await db.query(
            `INSERT INTO notifications (user_email, sender_email, type, message, link)
             VALUES (?, ?, 'friend_request', ?, ?)`,
            [friendEmail, userEmail, message, link]
        );

        res.json({ success: true, message: '친구 요청을 보냈습니다.' });
    } catch (err) {
        console.error('친구 요청 보내기 실패:', err);
        res.status(500).json({ success: false, message: '친구 요청 보내기 실패' });
    }
});

// 친구 수락
router.post('/accept', async (req, res) => {
    const { friendEmail, userEmail } = req.body;

    try {
        await db.query(`UPDATE friends SET status = 'accepted' WHERE user_email = ? AND friend_email = ?`, [friendEmail, userEmail]);
        // 역방향 추가
        await db.query(`INSERT INTO friends (user_email, friend_email, status) VALUES (?, ?, 'accepted')`, [userEmail, friendEmail]);

        res.json({ success: true, message: '친구 요청이 수락되었습니다.' });
    } catch (err) {
        console.error('친구 요청 응답 실패:', err);
        res.status(500).json({ success: false });
    }
});

// 친구 요청 취소
router.delete('/cancel', async (req, res) => {
    const { userEmail, friendEmail } = req.body;
    try {
        const [result] = await db.query(`DELETE FROM friends WHERE user_email = ? AND friend_email = ? AND status = "pending"`, [userEmail, friendEmail]);
        const [result2] = await db.query(`DELETE FROM friends WHERE user_email = ? AND friend_email = ? AND status = "pending"`, [friendEmail, userEmail]);
        if (result.affectedRows > 0 || result2.affectedRows > 0) {
            res.json({ success: true, message: '친구 요청이 취소되었습니다.' });
        } else {
            return res.status(404).json({ success: false, message: '해당 요청을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// 친구 삭제(reject/차단)
router.put('/delete', async (req, res) => {
    const { userEmail, friendEmail } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE friends 
            SET status = 'rejected' 
            WHERE 
                (user_email = ? AND friend_email = ?)
                OR 
                (user_email = ? AND friend_email = ?)`,
            [userEmail, friendEmail, friendEmail, userEmail]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '친구 관계가 없습니다.' });
        }

        res.json({ success: true, message: '친구가 삭제되었습니다.' });
    } catch (err) {
        console.error('친구 삭제 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// 친구 요청 목록 조회
router.get('/request/:email', async (req, res) => {
    const { email } = req.params;

    try {
        // 받은 친구 요청 (상대방이 나에게 보낸 요청)
        const [received] = await db.query(
            `SELECT u.email, u.nickname, u.profile_image, u.bio, f.created_at
             FROM friends f
             JOIN users u ON f.user_email = u.email
             WHERE f.friend_email = ? AND f.status = 'pending'`,
            [email]
        );

        // 보낸 친구 요청 (내가 보낸 요청)
        const [sent] = await db.query(
            `SELECT u.email, u.nickname, u.profile_image, u.bio, f.created_at
             FROM friends f
             JOIN users u ON f.friend_email = u.email
             WHERE f.user_email = ? AND f.status = 'pending'`,
            [email]
        );

        res.json({ success: true, received, sent });
    } catch (err) {
        console.error('친구 목록 조회 실패:', err);
        res.status(500).json({ success: false, message: '친구 목록 조회 실패' });
    }
});

// 친구 목록 조회
router.get('/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT u.email, f.user_email, u.nickname, u.profile_image, u.bio
            FROM friends f
            JOIN users u ON (
                (f.user_email = ? AND f.friend_email = u.email) OR
                (f.friend_email = ? AND f.user_email = u.email)
            )
            WHERE f.user_email = ? and f.status = 'accepted'`,
            [email, email, email]
        );
        
        res.json({ success: true, friends: rows});
    } catch (err) {
        console.error('친구 목록 조회 실패:', err);
        res.status(500).json({ success: false, message: '친구 목록 조회 실패' });
    }
});

module.exports = router;
