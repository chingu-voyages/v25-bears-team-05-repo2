// import { createError } from "../utils/errors";
import express from "express";
const router = express.Router();
import assert from "assert";
import { body, validationResult } from "express-validator/check";
import axios from "axios";
import { createError } from "../utils/errors";
const isProduction =
  process.env.NODE_ENV && process.env.NODE_ENV.match("production");

const captchaSecretKey = isProduction
  ? process.env.PRODUCTION_CAPTCHA_SECRET_KEY
  : process.env.DEV_CAPTCHA_SECRET_KEY;
assert(captchaSecretKey, "captcha secret key is not defined.");

const sanitizationObject = [
  body("email").isEmail().normalizeEmail({ all_lowercase: true }),
  body("captcha").exists().not().isEmpty(),
];

router.post("/", sanitizationObject, async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusMessage = JSON.stringify(errors.array());
    return res.status(400).end();
  }
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${captchaSecretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
  try {
    const response = await axios.post(verifyUrl);
    if (response.data.success === true) {
      res.status(200).json({ response: "ok" });
      // Do some logic
    } else {
      res.statusMessage =
        "Captcha challenge was not successful. Please try again.";
      return res.status(400).end();
    }
  } catch (err) {
    res.status(400).send({
      errors: [
        {
          ...createError(
            "password recovery",
            `captcha verification error. ${err}`,
            "captcha"
          ),
        },
      ],
    });
  }
});

export default router;
