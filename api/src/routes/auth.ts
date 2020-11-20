import * as express from "express";
import { Request, Response } from "express";
import passport from "passport";
import { routeProtector } from "../middleware/route-protector";
import GooglePassportStrategy from "../authentication-strategies/google-passport-strategy";
const router = express.Router();
passport.use("google", GooglePassportStrategy);

router.get("/success", routeProtector, (_req: Request, res: Response) => {
  // Placeholder for proper landing page
  res.send("authenticated successfully");
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"]}));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth_failed"}), (_req: Request, res: Response) => {
  res.redirect("/auth/success"); // Change this to a proper landing page
});

router.post("/logout", routeProtector, (req: Request, res: Response) => {
  req.logOut();
});

router.post("/register", (req: Request, res: Response) => {

});


export default router;
