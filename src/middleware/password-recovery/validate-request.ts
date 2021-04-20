import { NextFunction, Response, Request } from "express";
import { UserModel } from "../../models/user/user.model";
import { IUserDocument } from "../../models/user/user.types";
import { encrypt } from "../../utils/crypto";

/**
 * This middleware hits the db and ensures that there is an account associated with the e-mail
 * We also want to make sure that the e-mail is a local auth account (not a google oauth)
 * @param res
 * @param req
 * @param next
 */
export async function validateRequestByEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const encryptedEmail = encrypt(req.body.email);
  try {
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);
    if (isGoogleAuthAccount(result)) {
      res.statusMessage = `Password recovery request cannot be completed for ${req.body.email}`;
      return res.status(400).end();
    }
    next();
  } catch (error) {
    res.statusMessage = "There was an error in validating the request";
    return res.status(400).end();
  }
}

export function isGoogleAuthAccount(userAccount: IUserDocument): boolean {
  return userAccount && !!userAccount.auth.googleId;
}
