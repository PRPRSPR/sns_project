const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

// 일기 작성
router.post('/create', async (req, res) => {
    const { email, date, memo, emotion_tag, is_private } = req.body;

    if (!email || !date || !emotion_tag || !memo) {
        return res.status(400).json({ success: false, message: '필수 항목 누락' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO diaries (email, date, memo, emotion_tag, is_private) VALUES (?, ?, ?, ?, ?)',
            [email, date, memo, emotion_tag, is_private]
        );

        res.status(201).json({ success: true, diaryId: result.insertId, message: '일기 작성 성공!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// 일기 목록 조회
router.get('/:email', auth, async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT d.id, d.date, d.memo, d.emotion_tag, m.mediaPath AS thumbnailPath
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

router.get('/count/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT COUNT(*) AS count
            FROM diaries d
            WHERE d.email = ? AND d.is_deleted = FALSE
      `, [email]);

        res.json({ success: true, count: rows[0].count });
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

        // 댓글 목록
        const [commentResult] = await db.query(
            `SELECT c.*, u.nickname 
             FROM comments c
             JOIN users u ON c.email = u.email
             WHERE c.diary_id = ?
             ORDER BY c.created_at ASC`,
            [id]
        );

        const commentMap = {};
        const roots = [];

        commentResult.forEach(c => {
            c.replies = [];
            commentMap[c.id] = c;
        });

        commentResult.forEach(c => {
            if (c.parent_comment_id) {
                commentMap[c.parent_comment_id]?.replies.push(c);
            } else {
                roots.push(c);
            }
        });

        // 미디어 목록
        const [mediaResult] = await db.query(
            `SELECT * FROM media WHERE diaryId = ?`,
            [id]
        );

        res.json({
            success: true,
            detail: diaryResult[0],
            comments: roots,
            media: mediaResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    const diaryId = req.params.id;
    const userEmail = req.user.email;

    try {
        const [diaryCheck] = await db.query(
            'SELECT * FROM diaries WHERE id = ? AND email = ?',
            [diaryId, userEmail]
        );

        if (diaryCheck.length === 0) {
            return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
        }

        await db.query('DELETE FROM diaries WHERE id = ?', [diaryId]);
        await db.query('DELETE FROM media WHERE diaryId = ?', [diaryId]); // 관련 미디어도 삭제
        await db.query('DELETE FROM comments WHERE diary_id = ?', [diaryId]); // 댓글 삭제

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const diaryId = req.params.id;
    const { emotion_tag, memo } = req.body;
    const userEmail = req.user.email;

    try {
        // 다이어리 정보 조회
        const [rows] = await db.query('SELECT email, editable_until FROM diaries WHERE id = ?', [diaryId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '일기를 찾을 수 없습니다.' });
        }

        const diary = rows[0];
        console.log(diary.email);

        // 1. 작성자 확인
        if (diary.email !== userEmail) {
            return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
        }

        // 2. editable_until 확인
        const now = new Date();
        const editableUntil = new Date(diary.editable_until);

        if (now > editableUntil) {
            return res.status(403).json({ success: false, message: '수정 가능한 시간이 지났습니다.' });
        }

        // 수정 실행
        await db.query(
            'UPDATE diaries SET emotion_tag = ?, memo = ?, updated_at = NOW() WHERE id = ?',
            [emotion_tag, memo, diaryId]
        );

        res.json({ success: true, message: '일기가 수정되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;
