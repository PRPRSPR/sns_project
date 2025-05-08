const express = require('express');
const router = express.Router();
const db = require('../db');

// 댓글 작성
router.post('/:diaryId', async (req, res) => {
    const { diaryId } = req.params;
    const { comment } = req.body;
    const email = req.user.userEmail;

    try {
        const result = await db.query(
            `INSERT INTO comments (email, diary_id, comment) VALUES (?, ?, ?)`,
            [email, diaryId, comment]
        );

        // 닉네임 포함해서 반환 (프론트 갱신용)
        const [userInfo] = await db.query(`SELECT nickname FROM users WHERE email = ?`, [email]);

        res.json({
            success: true,
            comment: {
                id: result[0].insertId,
                email,
                comment,
                nickname: userInfo[0].nickname
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '댓글 저장 오류' });
    }
});

// 댓글 삭제 (소프트 삭제)
router.delete('/:id', async (req, res) => {
    try {
        await pool.query(
            `UPDATE comments SET is_deleted = TRUE WHERE id = ?`,
            [req.params.id]
        );
        res.json({ message: '삭제 완료' });
    } catch (err) {
        res.status(500).json({ error: '삭제 실패' });
    }
});

module.exports = router;
