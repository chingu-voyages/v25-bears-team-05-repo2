import dayjs from "dayjs";
import { isPasswordValid } from "../../middleware/password-validator";
import { decrypt, encrypt } from "../../utils/crypto";
import { generateAuthToken } from "../../utils/generate-auth-token";
import { UserModel } from "../user/user.model";
import { PasswordRecoveryModel } from "./password-recovery.model";
import {
  IPasswordRecovery,
  IPasswordRecoveryDocument,
} from "./password-recovery.types";

/**
 * Returns all the requests for a given e-mail user account
 * @param emailId: Email address for which request is being made
 */
export async function findAllRequestsByEmailId(emailId: string) {
  const allRequests = await PasswordRecoveryModel.find();
  return allRequests.filter(
    (request) => decrypt(request.forAccountEmail) === emailId
  );
}

export async function findRequestByEmailAndAuthToken({
  emailId,
  authToken,
}: {
  emailId: string;
  authToken: string;
}) {
  const allRequests = await PasswordRecoveryModel.find();
  const matchingRequests = allRequests.filter(
    (request) =>
      decrypt(request.forAccountEmail) === emailId &&
      request.authToken === authToken
  );
  if (matchingRequests.length > 0) return matchingRequests[0];
  return null;
}
/**
 *
 * @param data Contains the e-mail account for which
 */
export async function createRequest(data: {
  emailId: string;
  requestorIpAddress: string;
}) {
  const newRequest: IPasswordRecovery = {
    authToken: generateAuthToken(),
    forAccountEmail: encrypt(data.emailId),
    requestorIpAddress: data.requestorIpAddress,
    updatedAt: new Date(),
    requestExpiryDate: dayjs()
      .add(parseInt(process.env.PASSWORD_RECOVERY_EXPIRY_MINUTES), "minute")
      .toDate(),
  };
  return await PasswordRecoveryModel.create(newRequest);
}

/**
 * This updates the user auth record with new password and updates the password recovery
 * request record, closing things off.
 * @param this instance of IPasswordRecoveryDocument
 * @param newPassword plain text password to update
 */
export async function fulfill(
  this: IPasswordRecoveryDocument,
  newPassword: string
) {
  if (!isPasswordValid(newPassword))
    throw new Error("New password doesn't meet security requirements");

  const user = await UserModel.findByEncryptedEmail(this.forAccountEmail);
  await user[0].changePassword(newPassword);
  this.updatedAt = new Date();
  this.requestClosed = true;
  this.requestClosedDate = new Date();
  this.requestIsClaimed = true;
  return await this.save();
}
