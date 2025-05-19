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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`http://localhost:3000/home?token=${token}`);
    }
);

router.post('/reset-pwd/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const isValidPassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/;
        return regex.test(password);
    };

    if (!isValidPassword(newPassword)) {
        return res.status(400).json({ success: false, message: "비밀번호 형식이 올바르지 않습니다." });
    }

    try {
        // 토큰 유효성 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // DB 업데이트
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: '유효하지 않거나 만료된 토큰입니다.' });
    }
});

router.post('/forgot-pwd', async (req, res) => {
    const { email } = req.body;

    try {
        // 사용자가 존재하는지 확인
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '등록되지 않은 이메일입니다.' });
        }
        if (rows[0].password === null) {
            return res.status(400).json({
                success: false,
                message: 'Google 계정으로 가입된 이메일입니다. 비밀번호를 재설정하려면 Google 로그인을 이용하세요.',
            });
        }

        // 재설정 토큰 생성 (JWT 또는 랜덤 토큰)
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // 재설정 링크 구성
        const resetLink = `http://localhost:3000/reset-pwd/${token}`;

        // 이메일 발송
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '[오늘 하루] 비밀번호 재설정 링크',
            html: `
                <h3>비밀번호 재설정 요청</h3>
                <p>아래 링크를 클릭하여 비밀번호를 재설정하세요.</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>이 링크는 15분 동안 유효합니다.</p>
            `,
        });

        res.json({ success: true, message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

router.get('/check-email/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(404).json({ success: false, message: '이미 사용중인 이메일 입니다.' });
        }

        res.json({ success: true, message: '사용 가능한 이메일 입니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

router.post('/signup', async (req, res) => {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    const isValidPassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/;
        return regex.test(password);
    };

    if (!isValidPassword(password)) {
        return res.status(400).json({ message: "비밀번호 형식이 올바르지 않습니다." });
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