import * as express from "express";
import { Request, Response } from "express";
import passport from "passport";
import { routeProtector } from "../middleware/route-protector";
import { checkNotAuthenticated } from "../middleware/login-validator";

import LocalPassportStrategy from "../authentication-strategies/local-passport-strategy";
import { UserModel } from "../models/user/user.model";
import { IUserRegistrationDetails } from "../models/user/user.types";
import { validatePassword } from "../middleware/password-validator";
passport.use("local", LocalPassportStrategy);


const router = express.Router();

router.get("/", (req, res) => {
  res.send("you've reached the register/local get route");
});

router.post("/", validatePassword,
  async(req: Request, res: Response) => {

    const userDetails: IUserRegistrationDetails = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      plainTextPassword: req.body.password
    };
    const result = await UserModel.registerUser(userDetails);
});

export default router;
