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
  };
  return await PasswordRecoveryModel.create(newRequest);
}

export async function fulfill(
  this: IPasswordRecoveryDocument,
  newPassword: string
) {
  if (!isPasswordValid(newPassword))
    throw new Error("New password doesn't meet security requirements");

  // Find the user
  UserModel.findByEncryptedEmail(this.forAccountEmail);
}
