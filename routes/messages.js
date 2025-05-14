const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/send', upload.single('media'), async (req, res) => {
  const { senderEmail, receiverEmail, content } = req.body;
  let mediaUrl = null;
  let mediaType = null;

  if (req.file) {
    mediaUrl = req.file.path;
    const mimeType = req.file.mimetype;

    if (mimeType.startsWith('image/')) mediaType = 'image';
    else if (mimeType.startsWith('video/')) mediaType = 'video';
    else mediaType = 'file';
  }

  try {
    await db.query(
      `INSERT INTO messages (sender_email, receiver_email, content, media_url, media_type)
       VALUES (?, ?, ?, ?, ?)`,
      [senderEmail, receiverEmail, content, mediaUrl, mediaType]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get('/convers/:email', auth, async (req, res) => {
  const userEmail = req.params.email;

  try {
    const [rows] = await db.query(
      `
      SELECT
        m.id,
        m.content,
        m.created_at,
        m.sender_email,
        m.receiver_email,
        m.media_url,
        m.media_type,
        other_user.email AS other_email,
        other_user.nickname AS other_nickname,
        other_user.profile_image AS other_profile,
        (
          SELECT COUNT(*)
          FROM messages
          WHERE sender_email = other_user.email
            AND receiver_email = ?
            AND is_read = 0
        ) AS unread_count
      FROM (
        SELECT
          IF(sender_email = ?, receiver_email, sender_email) AS user_email,
          MAX(created_at) AS last_time
        FROM messages
        WHERE sender_email = ? OR receiver_email = ?
        GROUP BY user_email
      ) latest
      JOIN messages m ON (
        (m.sender_email = ? AND m.receiver_email = latest.user_email) OR
        (m.receiver_email = ? AND m.sender_email = latest.user_email)
      ) AND m.created_at = latest.last_time
      JOIN users other_user ON other_user.email = latest.user_email
      ORDER BY m.created_at DESC
      `,
      [userEmail, userEmail, userEmail, userEmail, userEmail, userEmail]
    );

    res.json({ success: true, conversations: rows });
  } catch (error) {
    console.error('대화 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

router.get('/:email', auth, async (req, res) => {
  const myEmail = req.user.email;
  const { email } = req.params;

  try {
    // 읽음 처리
    await db.query(`
      UPDATE messages
      SET is_read = 1
      WHERE sender_email = ? AND receiver_email = ? AND is_read = 0
    `, [email, myEmail]);

    const [messages] = await db.query(`
            SELECT * FROM messages
            WHERE (sender_email = ? AND receiver_email = ?)
               OR (sender_email = ? AND receiver_email = ?)
            ORDER BY created_at ASC
        `, [myEmail, email, email, myEmail]);

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: '메시지 불러오기 실패' });
  }
});

module.exports = router;