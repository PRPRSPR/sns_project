const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// const JWT_SECRET = '12345678912345678912345678912345';
const JWT_SECRET = process.env.JWT_SECRET;

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
        console.log(hashedPassword);

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
        const token = jwt.sign(
            {
                email: user.email,
                nickname: user.nickname,
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ success: true, message: '로그인 성공', token });

    } catch (err) {
        console.error('로그인 에러:', err.message);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;