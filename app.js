const express = require("express");
const session = require("express-session");
const passport = require("passport");
const indexRouter = require("./routes/indexRouter");
const path = require("path");
const methodOverride = require("method-override");

require("./config/passport");

require('dotenv').config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    store: new (require("connect-pg-simple")(session))({
        conString: process.env.CONNECTION_URI + "?sslmode=require",
        ssl: { require: true, rejectUnauthorized: false }
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});