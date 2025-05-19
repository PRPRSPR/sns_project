const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post('/upload/:id', upload.single('media'), async (req, res) => {
    const { id } = req.params;

    const { mediaType, thumbnailYn, order } = req.body;
    const file = req.file;

    if (!file || !id || !mediaType) {
        return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    }

    const mediaPath = file.path.replace(/\\/g, '/');

    try {
        const result = await db.query(
            'INSERT INTO media (diaryId, mediaPath, mediaType, thumbnailYn, mediaOrder) VALUES (?, ?, ?, ?, ?)',
            [id, mediaPath, mediaType, thumbnailYn || 'N', parseInt(order)]
        );

        res.status(201).json({ success: true, message: '미디어 업로드 완료!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
