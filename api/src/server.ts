require("dotenv").config();
const cors = require("cors");
import bodyParser from "body-parser";
import express from "express";
import passport from "passport";
// require("./config/passport");
import GooglePassportStrategy from "./config/passport-configuration";
import connectDB from "../config/database";
const cookieSession = require("cookie-session");

const app = express();

// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", process.env.SERVER_PORT || 7000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
  name: "synced-up",
  keys: ["key1", "key2"]
}));

passport.use(GooglePassportStrategy);
// @route   GET /
// @desc    Test Base API
// @access  Public
app.get("/", (_req, res) => {
  res.send("API Running");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"]}));

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/auth_failed"}), (_req, res) => {
  res.redirect("/auth_success");
});

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;
