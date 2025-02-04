const {genPassword} = require("../lib/passwordUtils");
const db = require("../config/database");

const getIndexPage = async (req, res) => {
    try {
        const {rows} = await db.query("SELECT posts.id, posts.title, posts.message_text, posts.created_at, users.username FROM posts INNER JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC");
        const posts = rows;

        res.render("index", {user: req.user, posts});
    } catch (err) {
        console.error(err);
    }
}

const getSignupPage = (req, res) => {
    if (req.user) {
        res.redirect("/");
    }

    res.render("signup", {errors: []});
}

const postSignup = async (req, res, next) => {
    const {first_name, last_name, username, password} = req.body;
    const passwordHash = await genPassword(password);
    
    try {
        await db.query("INSERT INTO users (first_name, last_name, username, password_hash) VALUES ($1, $2, $3, $4)", [first_name, last_name, username, passwordHash]);

        const {rows} = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];

        req.login(user, err => {
            if (err) {
                return next(err);
            }

            res.redirect("/");
        })
    } catch (err) {
        console.error(err);
    }
}

const getLoginPage = (req, res) => {
    res.render("login", {messages: req.flash("error")});
}

const logout = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }

        res.redirect("/");
    });
}

const getJoinClubPage = (req, res) => {
    res.render("joinClub", {errors: []});
};

const postJoinClub = async (req, res) => {
    const {passcode} = req.body;
    const userId = req.user.id;

    if (passcode !== process.env.MEMBER_PASSCODE) {
        return res.render("joinClub", {errors: [{msg: "Incorrect passcode."}]})
    }

    try {
        const {rows} = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (user) {
            await db.query("UPDATE users SET membership_status = TRUE WHERE id = $1", [userId]);

            return res.redirect("/");
        }
    } catch (err) {
        console.error(err);
    }
}

const getNewMessagePage = (req, res) => {
    res.render("newMessage");
};

const postNewMessage = async (req, res) => {
    const {title, message_text} = req.body;

    try {
        await db.query("INSERT INTO posts (user_id, title, message_text) VALUES ($1, $2, $3)", [req.user.id, title, message_text]);
        
        res.redirect("/");
    } catch (err) {
        console.error(err);
    }
};

const deleteMessage = async (req, res) => {
    const {id} = req.params;

    try {
        await db.query("DELETE FROM posts WHERE id = $1", [id]);

        res.redirect("/");
    } catch (err) {
        console.error(err);
    }
}

const getAdminPage = (req, res) => {
    res.render("admin", {errors: []});
}

const postAdminPage = async (req, res) => {
    const {passcode} = req.body;
    const userId = req.user.id;

    if (passcode !== process.env.ADMIN_PASSCODE) {
        return res.render("admin", {errors: [{msg: "Incorrect passcode."}]})
    }

    try {
        const {rows} = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (user) {
            await db.query("UPDATE users SET admin = TRUE WHERE id = $1", [userId]);

            return res.redirect("/");
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getIndexPage,
    getSignupPage,
    postSignup,
    getLoginPage,
    logout,
    getJoinClubPage,
    postJoinClub,
    getNewMessagePage,
    postNewMessage,
    deleteMessage,
    getAdminPage,
    postAdminPage
}