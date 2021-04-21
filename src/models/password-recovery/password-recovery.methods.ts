import { generateAuthToken } from "../../utils/generate-auth-token";
import { PasswordRecoveryModel } from "./password-recovery.model";
import { IPasswordRecovery } from "./password-recovery.types";

/**
 * Returns all the requests for a given e-mail user account
 * @param emailId: Email address for which request is being made
 */
export async function findAllRequestsByEmailId(emailId: string) {
  return PasswordRecoveryModel.find({ "forAccountEmail": emailId });
}


export async function findRequestByEmailAndAuthToken(data: {emailId: string, authToken: string}) {
  return await PasswordRecoveryModel.findOne({ "forAccountEmail": data.emailId, "authToken": data.authToken })
}
/**
 *
 * @param this
 * @param data Contains the e-mail account for which
 */
export async function createRequest(data: {
  emailId: string;
  requestorIpAddress: string;
}) {
  const newRequest: IPasswordRecovery = {
    authToken: generateAuthToken(),
    forAccountEmail: data.emailId,
    requestorIpAddress: data.requestorIpAddress,
    updatedAt: new Date(),
  };
  return await PasswordRecoveryModel.create(newRequest);
}
