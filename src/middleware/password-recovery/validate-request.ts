import { NextFunction, Response, Request } from "express";
import { UserModel } from "../../models/user/user.model";
import { encrypt } from "../../utils/crypto";

/**
 * This middleware hits the db and ensures that there is an account associated with the e-mail
 * We also want to make sure that the e-mail is a local auth account (not a google oauth)
 * @param res 
 * @param req 
 * @param next 
 */
export async function validateRequestByEmail (res: Response, req: Request, next: NextFunction) {
  const encryptedEmail = encrypt(req.body.email);
  try {
    const result = await UserModel.findByEncryptedEmail(encryptedEmail);

  } catch (error) {
    res
  }
}
