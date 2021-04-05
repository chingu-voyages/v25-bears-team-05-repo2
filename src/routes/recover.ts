// import { createError } from "../utils/errors";
import express from "express";
const router = express.Router();
import assert from "assert";
import { body, validationResult } from "express-validator/check";
const isProduction =
  process.env.NODE_ENV && process.env.NODE_ENV.match("production");

const captchaSecretKey = isProduction ? process.env.PRODUCTION_CAPTCHA_SECRET_KEY : process.env.DEV_CAPTCHA_SECRET_KEY
assert(captchaSecretKey, "captcha secret key is not defined.")

const sanitizationObject = [body("email").isEmail().normalizeEmail({ all_lowercase: true }), body("captcha").exists()]
router.post("/", sanitizationObject, (req:any, res:any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  res.status(200).json({ response: "ok" })
});

export default router;
