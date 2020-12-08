import * as express from "express";
import { Request, Response } from "express";
import { UserModel } from "../models/user/user.model";
import { IUserRegistrationDetails } from "../models/user/user.types";
import { validatePassword } from "../middleware/password-validator";
import { body, validationResult } from "express-validator/check";
import passport from "passport";
import LocalPassportStrategy from "../authentication-strategies/local-passport-strategy";
import { encrypt } from "../utils/crypto";

passport.use("local", LocalPassportStrategy);

const sanitizationObject = [ body("email").isEmail().normalizeEmail({ all_lowercase: true }),
  body("password").isLength({ min: 8}).trim().escape(),
  body("firstName").trim().escape(),
  body("lastName").trim().escape() ];

const router = express.Router();

router.post("/", sanitizationObject, validatePassword,
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const userDetails: IUserRegistrationDetails = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      encryptedEmail: encrypt(req.body.email),
      plainTextPassword: req.body.password
    };

    try {
      const result = await UserModel.registerUser(userDetails);
      if (result) {
       req.logIn(result, (err) => {
         if (err) { console.log(err); }
         return res.redirect("/register/local/success");
       });
      }
    } catch (err) {
      if (err.toString().match(/Error: User with email \w*/)) {
        res.status(409).send(err);
      }
      else {
        res.status(400).send(err);
      }
    }
});

export default router;
