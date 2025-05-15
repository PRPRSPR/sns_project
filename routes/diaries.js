const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

// 일기 작성
router.post('/create', async (req, res) => {
    const { email, date, memo, emotion_tag, is_private } = req.body;

    if (!email || !date || !emotion_tag || !memo) {
        return res.status(400).json({ success: false, message: '태그 선택 및 내용 작성이 필요합니다.' });
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
            WHERE d.email = ?
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

router.get('/date/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const [rows] = await db.query(
            'SELECT DATE_FORMAT(date, "%Y-%m-%d") as date FROM diaries WHERE email = ?',
            [email]
        );

        const dates = rows.map(row => row.date);
        res.json({ success: true, dates });
    } catch (err) {
        console.error('날짜 조회 실패:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
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

        // 리액션 수 조회
        const [reactionCounts] = await db.query(
            `SELECT reaction_type, COUNT(*) AS count
             FROM reactions
             WHERE diary_id = ?
             GROUP BY reaction_type`,
            [id]
        );

        const reactionSummary = {};
        reactionCounts.forEach(row => {
            reactionSummary[row.reaction_type] = row.count;
        });

        res.json({
            success: true,
            detail: diaryResult[0],
            comments: roots,
            media: mediaResult,
            reactions: reactionSummary
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

router.get('/all/:date', auth, async (req, res) => {
    const { date } = req.params;
    const myEmail = req.user.email;

    // date 칼럼이 해당 날짜인 모든 일기 조회
    try {
        const [rows] = await db.query(`
            SELECT 
                d.*, 
                ANY_VALUE(u.nickname) AS nickname,
                ANY_VALUE(u.profile_image) AS profile_image,
                ANY_VALUE(m.mediaPath) AS thumbnailPath,
                COALESCE(SUM(r.reaction_type = 'like'), 0) AS likeCount,
                COALESCE(SUM(r.reaction_type = 'love'), 0) AS loveCount,
                COALESCE(SUM(r.reaction_type = 'angry'), 0) AS angryCount,
                COALESCE(SUM(r.reaction_type = 'surprised'), 0) AS surprisedCount,
                COALESCE(SUM(r.reaction_type = 'funny'), 0) AS funnyCount,
                COALESCE(SUM(r.reaction_type = 'clap'), 0) AS clapCount,
                COALESCE(SUM(r.reaction_type = 'sad'), 0) AS sadCount
            FROM diaries d
            LEFT JOIN users u ON d.email = u.email
            LEFT JOIN media m ON d.id = m.diaryId AND m.thumbnailYn = 'Y'
            LEFT JOIN reactions r ON d.id = r.diary_id
            WHERE 
                DATE(d.date) = ? 
                AND (
                    d.email = ? 
                    OR (
                        d.email IN (
                            SELECT 
                                CASE 
                                    WHEN f.user_email = ? THEN f.friend_email 
                                    ELSE f.user_email 
                                END
                            FROM friends f
                            WHERE f.user_email = ? OR f.friend_email = ?
                        )
                    )
                )
            GROUP BY d.id
            ORDER BY d.date DESC
        `, [date, myEmail, myEmail, myEmail, myEmail]);

        res.json({ success: true, list: rows });
    } catch (err) {
        console.error('일기 조회 실패:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;
