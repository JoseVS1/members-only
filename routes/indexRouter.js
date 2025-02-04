const { Router } = require("express");
const indexController = require("../controllers/indexController");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const passport = require("passport");
const flash = require("connect-flash");
const {isAuth} = require("../lib/authMiddleware");
const indexRouter = Router();

indexRouter.use(flash());

const validateSignup = [
    body("first_name").isAlpha().withMessage("First name should only contain letters."),
    body("last_name").isAlpha().withMessage("Last name should only contain letters."),
    body("username").custom(async value => {
        const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [value]);
        const user = rows[0];
    
        if (user) {
            throw new Error("Username already in use.");
        };
    }),
    body("password").isLength({min: 5}).withMessage("Password must be 5 characters long."),
    body("confirmPassword").custom((value, { req }) => {
        return value === req.body.password;
    }).withMessage("Passwords do not match.")
];

const signupErrorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render("signup", {
            errors: errors.array()
        })
    }

    next();
}

indexRouter.get("/", indexController.getIndexPage);
indexRouter.get("/sign-up", indexController.getSignupPage);
indexRouter.post("/sign-up", validateSignup, signupErrorHandler, indexController.postSignup);
indexRouter.get("/log-in", indexController.getLoginPage);
indexRouter.post("/log-in", passport.authenticate("local", {failureRedirect: "/log-in", successRedirect: "/", failureFlash: "Invalid username or password."}));
indexRouter.get("/log-out", isAuth, indexController.logout);
indexRouter.get("/join-club", isAuth, indexController.getJoinClubPage);
indexRouter.post("/join-club", indexController.postJoinClub);
indexRouter.get("/new-message", isAuth, indexController.getNewMessagePage);
indexRouter.post("/new-message", indexController.postNewMessage);
indexRouter.delete("/:id/delete", indexController.deleteMessage);
indexRouter.get("/admin", isAuth, indexController.getAdminPage);
indexRouter.post("/admin", indexController.postAdminPage);

module.exports = indexRouter;