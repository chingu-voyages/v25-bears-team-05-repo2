import * as express from "express";
import { Request, Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { checkNotAuthenticated } from "../middleware/login-validator";
const router = express.Router();
import passport from "passport";
import GooglePassportStrategy from "../authentication-strategies/google-passport-strategy";

passport.use("google", GooglePassportStrategy);

router.get("/google", checkNotAuthenticated, passport.authenticate("google", { scope: ["profile", "email"]}));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/"}), (_req: Request, res: Response) => {
  res.redirect("/success");
});

export default router;
