import express from "express";
import { body, validationResult } from "express-validator/check";
const router = express.Router();

import { validateCaptcha } from "../middleware/password-recovery/validate-captcha";
import { createRequest } from "../models/password-recovery/password-recovery.methods";
import { createError } from "../utils/errors";
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
    const requestData = {
      emailId: req.body.email,
      requestorIpAddress: req.connection.remoteAddress
    }
    try {
      const response = await createRequest(requestData);
      res.status(200).send({ response: "ok ", requestData: response }); // More processing to be done
    } catch (error) {
      res
      .status(400)
      .send({
        errors: [
          { ...createError("password recovery request error", `database error. ${error}`, "n/a") },
        ],
      });
    }
  }
);

export default router;
