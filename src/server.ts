require("dotenv").config();
import bodyParser from "body-parser";
import authRouter from "./routes/auth";
import localRegistrationRouter from "./routes/register-local";
import logOutRouter from "./routes/logout";
import usersRoute from "./routes/users/users";
import threadsRoute from "./routes/threads/threads";
import commentsRoute from "./routes/comments";
import feedRoute from "./routes/feed";
import searchRouter from "./routes/search";
import passwordRecoveryRouter from "./routes/recover";
import requestRouter from "./routes/request/request";
import express from "express";
import passport from "passport";
import checkClientApiPass from "./middleware/check-client-api-pass";

import { createError } from "./utils/errors";
const cookieSession = require("cookie-session");
const app = express();

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

const isProduction =
  process.env.NODE_ENV && process.env.NODE_ENV.match("production");

// Express configuration
app.set("port", process.env.PORT || 7000);
app.set("socketIo", io);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // Day
    name: "synced-up",
    keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2],
    domain: isProduction ? ".syncedup.live" : "localhost",
    // secure: isProduction
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// check client server is authorized to make requests
isProduction && app.use(checkClientApiPass);

app.use("/auth", authRouter);
app.use("/register/local", localRegistrationRouter);
app.use("/logout", logOutRouter);
app.use("/users", usersRoute);
app.use("/threads", threadsRoute);
app.use("/comments", commentsRoute);
app.use("/feed", feedRoute);
app.use("/search", searchRouter);
app.use("/recover", passwordRecoveryRouter);
app.use("/request", requestRouter);

app.get("/", (_req, res) => {
  res.send("API Running");
});

app.get("/success", (req: any, res) => {
  res.send(`<script>window.close()</script>`);
});

app.get("/fail", (req, res) => {
  res.status(400).send({
    errors: [{ ...createError("google-oauth", "Authentication error", "na") }],
  });
});

io.on("connection", (socket) => {
  socket.on("myId", (data)=> {
    socket.join(data);
  });
});

export default httpServer;
