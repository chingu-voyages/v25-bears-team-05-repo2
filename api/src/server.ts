require("dotenv").config();
const cors = require("cors");
import bodyParser from "body-parser";
import authRouter from "./routes/auth";
import localRegistrationRouter from "./routes/register-local";
import localLoginRouter from "./routes/login-local";
import logOutRouter from "./routes/logout";
import profileRoute from "./routes/profile";
import express from "express";
import passport from "passport";

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

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // Day
  name: "synced-up",
  keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/register/local", localRegistrationRouter);
app.use("/login/local", localLoginRouter);
app.use("/logout", logOutRouter);
app.use("/profile", profileRoute);

app.get("/", (_req, res) => {
  res.send("API Running");
});

app.get("/success", (req, res) => {
  res.send("authenticated successfully");
});
const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;
