import passport from "passport";
import LocalPassportStrategy from "../authentication-strategies/local-passport-strategy";
import * as express from "express";
import { checkNotAuthenticated } from "../middleware/login-validator";
const router = express.Router();
passport.use("local", LocalPassportStrategy);

router.post("/", checkNotAuthenticated,
passport.authenticate("local",
{ successRedirect: "/success",
failureRedirect: "/"}), (_req, _res) => {
});
export default router;
