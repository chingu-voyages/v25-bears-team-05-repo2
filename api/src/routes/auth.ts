import * as express from "express";
import { Request, Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { checkNotAuthenticated } from "../middleware/login-validator";
const router = express.Router();
import passport from "passport";
import GooglePassportStrategy from "../authentication-strategies/google-passport-strategy";

// console.log(body);
// const sanitizationObject = [ validator.body("email").isEmail().normalizeEmail(),
//   validator.body("password").isLength({ min: 8}).trim().escape(),
//   validator.body("firstName").trim().escape(),
//   validator.body("lastName").trim().escape() ];


router.get("/success", routeProtector, (_req: Request, res: Response) => {
  // Placeholder for proper landing page
  res.send("authenticated successfully");
});

router.post("/logout", routeProtector, (req: Request, res: Response) => {
  req.logOut();
  res.sendStatus(200);
});

router.post("/login", checkNotAuthenticated, (req: Request, res: Response) => {

});

passport.use("google", GooglePassportStrategy);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"]}));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth_failed"}), (_req: Request, res: Response) => {
  res.redirect("/auth/success"); // Change this to a proper landing page
});

export default router;
