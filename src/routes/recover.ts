import express from "express";
import { body, query, validationResult } from "express-validator/check";
const router = express.Router();

import { validateCaptcha } from "../middleware/password-recovery/validate-captcha";
import { validateIdDataRequest } from "../middleware/password-recovery/validate-id-data";
import { validateRequestByEmail } from "../middleware/password-recovery/validate-request";
import { createRequest } from "../models/password-recovery/password-recovery.methods";
import { PasswordRecoveryModel } from "../models/password-recovery/password-recovery.model";
import {
  requestIsClaimed,
  requestIsExpired,
} from "../models/password-recovery/utils";

import { createError } from "../utils/errors";
import { sendRecoveryEmail } from "../utils/mailer/mailer";

const sanitizationObject = [
  body("email").isEmail().normalizeEmail({ all_lowercase: true }),
  body("captcha").exists().not().isEmpty(),
];

router.post(
  "/",
  sanitizationObject,
  validateCaptcha,
  validateRequestByEmail,
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.statusMessage = JSON.stringify(errors.array());
      return res.status(400).end();
    }
    const requestData = {
      emailId: req.body.email,
      requestorIpAddress: req.connection.remoteAddress,
    };
    try {
      const response = await createRequest(requestData);
      await sendRecoveryEmail({
        destinationEmail: requestData.emailId,
        code: response.authToken,
      });
      res.status(200).send({ response: "ok ", requestData: "Request created" }); // More processing to be done
    } catch (error) {
      res.status(400).send({
        errors: [
          {
            ...createError(
              "password recovery request error",
              `database error. ${error}`,
              "n/a"
            ),
          },
        ],
      });
    }
  }
);

router.get(
  "/verify",
  [query("id").exists().trim(), query("data").exists().trim()],
  validateIdDataRequest,
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.statusMessage = JSON.stringify(errors.array());
      return res.status(400).end();
    }
    res.status(200).send({ id: req.query.id, data: req.query.data }); // Maybe some other token as well?
  }
);

router.patch(
  "/claim",
  [body("id").exists().trim(), body("data").exists().trim()],
  async (req: any, res: any) => {
    const { id, data, first_password, second_password } = req.body;

    if (first_password !== second_password) {
      res.statusMessage = "Passwords do not match.";
      return res.status(400).end();
    }
    const passwordChangeRequestObject = await PasswordRecoveryModel.findRequestByEmailAndAuthToken(
      { emailId: id, authToken: data }
    );

    if (passwordChangeRequestObject) {
      if (
        !requestIsClaimed(passwordChangeRequestObject) &&
        !requestIsExpired(passwordChangeRequestObject)
      ) {
        const result = await passwordChangeRequestObject.fulfill(
          first_password
        );
        if (result) return res.status(200).send("ok");
        res.statusMessage = "Request failed";
        return res.status(400).end();
      } else {
        res.status(400).send({
          errors: [
            {
              ...createError(
                "password recovery request expired or claimed",
                `request request object from database is marked as claimed or expired`,
                "password request object"
              ),
            },
          ],
        });
      }
    } else {
      res.status(404).send({
        errors: [
          {
            ...createError(
              "password recovery request is not found",
              `not found`,
              "n/a"
            ),
          },
        ],
      });
    }

    res.status(200).send("OK");
  }
);

export default router;
