import dayjs from "dayjs";
import { generateAuthToken } from "../../utils/generate-auth-token";
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
  return PasswordRecoveryModel.find({ "forAccountEmail": emailId });
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

function isRequestExpired(requestDocument: IPasswordRecoveryDocument): boolean {
  return dayjs().isAfter(requestDocument.requestExpiryDate);
}

function isRequestClaimed(requestDocument: IPasswordRecoveryDocument): boolean {
  return requestDocument.requestIsClaimed;
}

/**
 * Basically sets the document to have an expired state
 * @param requestDocument document to mark as expired
 */
export async function expireRequest(
  requestDocument: IPasswordRecoveryDocument
) {}

export function getOpenRequestsForEmailId(
  requestDocuments: IPasswordRecoveryDocument[]
): IPasswordRecoveryDocument[] {
  return requestDocuments.filter((document) => {
    return !isRequestExpired(document) && !isRequestClaimed(document);
  });
}
