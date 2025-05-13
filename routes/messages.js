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

router.get('/:email', auth, async (req, res) => {
    const myEmail = req.user.email;
    const { email } = req.params;

    try {
        const [messages] = await db.query(`
            SELECT * FROM messages
            WHERE (sender_email = ? AND receiver_email = ?)
               OR (sender_email = ? AND receiver_email = ?)
            ORDER BY created_at ASC
        `, [myEmail, email, email, myEmail]);

        res.json({ success: true, messages});
    } catch (err) {
        res.status(500).json({ success: false, message: '메시지 불러오기 실패' });
    }
});

module.exports = router;
// 중단점