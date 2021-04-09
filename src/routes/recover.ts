import express from "express";
import { body, validationResult } from "express-validator/check";
const router = express.Router();

import { validateCaptcha } from "../middleware/password-recovery/validate-captcha";
const sanitizationObject = [
  body("email").isEmail().normalizeEmail({ all_lowercase: true }),
  body("captcha").exists().not().isEmpty(),
];

router.post(
  "/",
  sanitizationObject,
  validateCaptcha,
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.statusMessage = JSON.stringify(errors.array());
      return res.status(400).end();
    }
    console.log("Captcha is validated");
    res.status(200).send({ response: "ok " }); // More processing to be done
  }
);

export default router;
