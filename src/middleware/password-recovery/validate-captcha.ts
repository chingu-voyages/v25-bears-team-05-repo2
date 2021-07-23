import { Request, Response, NextFunction } from "express";
import assert from "assert";
import { createError } from "../../utils/errors";
import axios from "axios";

const isProduction =
  process.env.NODE_ENV && process.env.NODE_ENV.match("production");
const captchaSecretKey = isProduction
  ? process.env.PRODUCTION_CAPTCHA_SECRET_KEY
  : process.env.DEV_CAPTCHA_SECRET_KEY;
assert(captchaSecretKey, "captcha secret key is not defined.");

export async function validateCaptcha(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${captchaSecretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;
  try {
    const response = await axios.post(verifyUrl);
    if (response.data.success === true) {
      next();
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
}
