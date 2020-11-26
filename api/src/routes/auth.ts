import * as express from "express";
import { Request, Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { checkNotAuthenticated } from "../middleware/login-validator";
const router = express.Router();
import passport from "passport";
import GooglePassportStrategy from "../authentication-strategies/google-passport-strategy";
import { createError } from "../utils/errors";

passport.use("google", GooglePassportStrategy);
router.get("/google", checkNotAuthenticated, passport.authenticate("google", { scope: ["profile", "email"]}));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/"}), (_req: Request, res: Response) => {
  res.redirect("/success");
});

router.post("/local", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.status(401).send(err);
      return next(err);
    }
    if (!user) {
      return res.status(401).send({ errors: [{ ...createError("local-login", info, "username and/or password" )}]});
    }
    req.logIn(user, () => {
       res.status(200).send({ message: "Local authentication successful", id: user.id});
    });
  }) (req, res, next);
});


router.get("/", routeProtector, (req, res) => { res.status(200).send(); })

export default router;
