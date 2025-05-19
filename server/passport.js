const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/user/google/callback",
    session: false
}, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const nickname = profile.displayName;
    const profile_image = profile.photos[0].value;

    try {
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            await db.query(
                `INSERT INTO users (email, nickname, profile_image, created_at, updated_at)
                 VALUES (?, ?, ?, NOW(), NOW())`,
                [email, nickname, profile_image]
            );
        }
        const token = jwt.sign(
            { email: user[0].email, nickname: user[0].nickname },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        return done(null, { token });
    } catch (err) {
        return done(err);
    }
}));

module.exports = passport;
