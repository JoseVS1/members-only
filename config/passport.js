const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../config/database");
const { validPassword } = require("../lib/passwordUtils");

const verifyCallback = async (username, password, done) => {
    try {
        const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];

        if (!user) {
            return done(null, false);
        }

        const isValid = await validPassword(password, user.password_hash);

        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        done(err);
    }
}

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
    try {
        const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (user) {
            done(null, user);
        }
    } catch (err) {
        done(err);
    }
})