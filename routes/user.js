const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('./passport');
const auth = require('../auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// const JWT_SECRET = '12345678912345678912345678912345';
const JWT_SECRET = process.env.JWT_SECRET;

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`http://localhost:3000/home?token=${token}`);
    }
);

router.post('/signup', async (req, res) => {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        // 이메일 중복 체크
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: '이메일이 이미 존재합니다.' });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 회원 정보 저장
        const result = await db.query(
            'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
            [email, hashedPassword, nickname]
        );

        res.json({ success: true, message: '회원가입 성공!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query("SELECT email, password, nickname FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: '존재하지 않는 계정입니다.' });
        }

        const user = users[0];

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
        }

        // JWT 생성
        const token = jwt.sign({
            email: user.email,
            nickname: user.nickname,
        }, JWT_SECRET, { expiresIn: '2h' }
        );

        res.json({ success: true, message: '로그인 성공', token });

    } catch (err) {
        console.error('로그인 에러:', err.message);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.get('/friends/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await db.query(
            'SELECT email, nickname, profile_image, bio FROM users WHERE email = ?',
            [email]
        );
        if (user[0].length === 0) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ success: true, user: user[0][0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.get('/:email', auth, async (req, res) => {
    const { email } = req.params;

    try {
        const user = await db.query(
            'SELECT email, nickname, profile_image, bio FROM users WHERE email = ?',
            [email]
        );
        if (user[0].length === 0) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ success: true, user: user[0][0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.put('/:email', auth, upload.single('profile_image'), async (req, res) => {
  const { email } = req.params;
  const { nickname, bio } = req.body;
  const profileImage = req.file ? req.file.path : null;

  try {
    const [[existing]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!existing) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    await db.query(
      `UPDATE users SET nickname = ?, bio = ?, ${profileImage ? 'profile_image = ?,' : ''} updated_at = NOW() WHERE email = ?`,
      profileImage ? [nickname, bio, profileImage, email] : [nickname, bio, email]
    );

    res.json({ success: true, message: '프로필이 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;