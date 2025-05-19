const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

router.get('/:email', auth, async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT *
            FROM notifications
            WHERE user_email = ?
            ORDER BY created_at DESC`,
            [email]
        );

        res.json({ success: true, notify: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.delete('/:id', async (req, res) => {
    const notificationId = req.params.id;

    try {
        await db.query(`DELETE FROM notifications WHERE id = ?`, [notificationId]);
        res.json({ success: true, message: '알림 삭제 완료' });
    } catch (err) {
        console.error('알림 삭제 실패:', err);
        res.status(500).json({ success: false, message: '알림 삭제 실패' });
    }
});

// 알림 읽음 처리
router.post('/read', async (req, res) => {
    const { notificationId } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
            [notificationId]
        );

        res.json({ success: true, message: '알림 읽음 처리 완료' });
    } catch (err) {
        console.error('알림 읽음 처리 실패:', err);
        res.status(500).json({ success: false, message: '알림 읽음 처리 실패' });
    }
});

// 전체 알림 읽음 처리
router.post('/read-all', async (req, res) => {
    const { userEmail } = req.body;

    try {
        await db.query(
            `UPDATE notifications SET is_read = 1 WHERE user_email = ?`,
            [userEmail]
        );
        res.json({ success: true, message: '전체 알림이 읽음 처리되었습니다.' });
    } catch (err) {
        console.error('전체 알림 읽음 처리 실패:', err);
        res.status(500).json({ success: false });
    }
});

// 알림 생성
router.post('/', async (req, res) => {
    const { user_email, type, message } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO notifications (user_email, type, message) VALUES (?, ?, ?)`,
            [user_email, type, message]
        );

        res.json({ success: true, message: '알림 생성 완료' });
    } catch (err) {
        console.error('알림 생성 실패:', err);
        res.status(500).json({ success: false, message: '알림 생성 실패' });
    }
});

module.exports = router;