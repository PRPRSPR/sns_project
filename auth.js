const jwt = require('jsonwebtoken');
// const JWT_SECRET = '12345678912345678912345678912345';
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("decoded >> ",decoded);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }
};