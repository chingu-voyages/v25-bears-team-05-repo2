import { NextFunction, Response, Request } from "express";
import { PasswordRecoveryModel } from "../../models/password-recovery/password-recovery.model";
import {
  requestIsClaimed,
  requestIsExpired,
} from "../../models/password-recovery/utils/request-expiry-validation";
import { decrypt } from "../../utils/crypto";

/**
 * This function is called when user initially clicks on e-mail link.
 * We hit the recovery request db and make sure there is a valid request.
 * If there isn't, send an error, causing client to show error message
 * If there is. Send OK and client will see a UI to update their password
 * @param req
 * @param res
 * @param next
 */
export async function validateIdDataRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id, data } = req.query;

  if (req.query.devBypass && !!req.query.devBypass === true) {
    console.warn(
      "\x1b[31m",
      "Warning: password request validation is being dev-bypassed"
    );
    next();
  }

  try {
    const decryptedEmailAddress = decrypt(id as string);
    const recoveryRequest = await PasswordRecoveryModel.findRequestByEmailAndAuthToken(
      { emailId: decryptedEmailAddress, authToken: data as string }
    );
    if (!recoveryRequest) {
      res.statusMessage = `Request not found`;
      return res.status(400).end();
    }
    if (requestIsExpired(recoveryRequest)) {
      res.statusMessage = `Request is expired`;
      return res.status(400).end();
    }
    if (requestIsClaimed(recoveryRequest)) {
      res.statusMessage = `Request is no longer valid`;
      return res.status(400).end();
    }
    next();
  } catch (error) {
    res.statusMessage = `Unable to validate request: ${error}`;
    return res.status(400).end();
  }
}
