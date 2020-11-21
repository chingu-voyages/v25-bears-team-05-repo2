import * as express from "express";
import { Request, Response } from "express";
import { UserModel } from "../models/user/user.model";
import { IUserRegistrationDetails } from "../models/user/user.types";
import { validatePassword } from "../middleware/password-validator";
import { body, validationResult } from "express-validator/check";
import passport from "passport";
import LocalPassportStrategy from "../authentication-strategies/local-passport-strategy";

passport.use("local", LocalPassportStrategy);

const sanitizationObject = [ body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8}).trim().escape(),
  body("firstName").trim().escape(),
  body("lastName").trim().escape() ];

const router = express.Router();

// POIJ Will be deleted
router.get("/", (req, res) => {
  res.status(200).send("you've reached the register/local get route");
});

// POIJ: to be deleted
router.get("/success", (req, res) => {
  // The user should have a cookie at this point
  console.log("User success register line 26,", req.user);
  res.status(200).send({ status: "registration successful", data: req.user}); // Reg successful // client should navigate to sign in page?
});

router.post("/", sanitizationObject, validatePassword,
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const userDetails: IUserRegistrationDetails = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      plainTextPassword: req.body.password
    };

    try {
      const result = await UserModel.registerUser(userDetails);
      // console.log("User entry", result);
      if (result) {
       req.logIn(result, (err) => {
         if (err) { console.log(err); }
         return res.redirect("/register/local/success");
       });
      }
    } catch (err) {
      console.log("Line 50", err);
      res.status(400).send({
        errors: [{ location: "error", message: err.message, param: "password" }] }
      );
    }
});


export default router;
