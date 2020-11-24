import passport from "passport";
import LocalPassportStrategy from "../authentication-strategies/local-passport-strategy";
import * as express from "express";
import { checkNotAuthenticated } from "../middleware/login-validator";
const router = express.Router();
passport.use("local", LocalPassportStrategy);

router.post("/", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.status(401).send(err);
      return next(err);
    }
    if (!user) {
      return res.status(401).send(info);
    }
    req.logIn(user, (done) => {
      res.status(200).send({ message: "Local authentication successful", id: user.id});
      done();
    });
  }) (req, res, next);
});

export default router;
