import { NextFunction, Response, Request } from "express";
import { PasswordRecoveryModel } from "../../models/password-recovery/password-recovery.model";
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
  const { id, data } = req.params;
  const decryptedEmailAddress = decrypt(id);
  try {
    const recoveryRequest = await PasswordRecoveryModel.findRequestByEmailAndAuthToken(
      { emailId: decryptedEmailAddress, authToken: data }
    );
    if (!recoveryRequest) {
      res.statusMessage = `Request not found`;
      return res.status(400).end();
    }
    next();
  } catch (error) {
    res.statusMessage = `${error}`;
    return res.status(400).end();
  }
}
