const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

// 댓글 작성
router.post('/:diaryId', auth, async (req, res) => {
    const { diaryId } = req.params;
    const { email, comment, parentId = null } = req.body;

    try {
        await db.query(
            `INSERT INTO comments (email, diary_id, comment, parent_comment_id) VALUES (?, ?, ?, ?)`,
            [email, diaryId, comment, parentId]
        );

        res.json({ success: true, message: '댓글 등록 완료' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '댓글 저장 오류' });
    }
});

router.put('/:commentId', auth, async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userEmail = req.user.email;

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ success: false, message: '댓글 내용을 입력해주세요.' });
    }

    try {
        // 댓글 작성자가 현재 로그인 사용자와 일치하는지 확인
        const [rows] = await db.query('SELECT email FROM comments WHERE id = ?', [commentId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
        }
        if (rows[0].email !== userEmail) {
            return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
        }

        // 댓글 내용 업데이트
        await db.query('UPDATE comments SET comment = ?, updated_at = NOW() WHERE id = ?', [comment, commentId]);

        res.json({ success: true, message: '댓글이 수정되었습니다.' });
    } catch (err) {
        console.error('댓글 수정 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

router.delete('/:commentId', auth, async (req, res) => {
    const { commentId } = req.params;
    const userEmail = req.user.email;

    try {
        // 댓글 작성자 확인
        const [rows] = await db.query('SELECT email FROM comments WHERE id = ?', [commentId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
        }
        if (rows[0].email !== userEmail) {
            return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
        }

        // is_deleted 컬럼을 true로 업데이트 (논리 삭제)
        await db.query('UPDATE comments SET is_deleted = TRUE WHERE id = ?', [commentId]);

        res.json({ success: true, message: '댓글이 삭제 처리되었습니다.' });
    } catch (err) {
        console.error('댓글 삭제 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
