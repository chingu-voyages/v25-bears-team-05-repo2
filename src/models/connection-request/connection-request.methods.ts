import { UserModel } from "../user/user.model";
import { IUserDocument } from "../user/user.types";
import {
  IConnectionRequestDocument,
  IConnectionRequestModel,
} from "./connection-request.types";

/**
 *
 * @param this Instance of connection request model
 * @param data requestor and approver Ids
 */
export async function generateConnectionRequest(
  this: IConnectionRequestModel,
  data: { requestorId: string; approverId: string, isTeamMate: boolean },
): Promise<{
  document: IConnectionRequestDocument;
  requestExists: boolean;
}> {
  const requestor = await UserModel.findById(data.requestorId);
  const approver = await UserModel.findById(data.approverId);
  let requestExistsInUserConnectionRequests = false;
  if (!requestor) {
    throw new Error("Invalid requestor");
  }
  if (!approver) {
    throw new Error("Invalid approver");
  }

  const requestDocument = await this.create({
    requestorId: data.requestorId,
    approverId: data.approverId,
    isTeamMate: data.isTeamMate,
  });

  if (!requestor["connectionRequests"][approver.id.toString()]) {
    requestor["connectionRequests"][approver.id.toString()] =
      requestDocument.id.toString();
    requestor.markModified("connectionRequests");
    await requestor.save();
  } else {
    requestExistsInUserConnectionRequests = true;
  }
  return {
    document: requestDocument,
    requestExists: requestExistsInUserConnectionRequests,
  };
}
/**
 *
 * @param this instance
 * @param data requestorId and approverId user ids
 * @return Promise<IUserDocument>
 */
export async function deleteConnectionRequest(
  this: IConnectionRequestModel,
  data: { requestorId: string; approverId: string },
): Promise<IUserDocument> {
  const requestor = await UserModel.findById(data.requestorId);
  const approver = await UserModel.findById(data.approverId);
  if (!requestor) {
    throw new Error("Invalid requestor");
  }
  if (!approver) {
    throw new Error("Invalid approver");
  }

  // Delete all requests with matching requestor and approverIds
  await this.deleteMany({
    "$and": [
      { "requestorId": data.requestorId },
      { "approverId": data.approverId },
    ],
  });

  delete requestor["connectionRequests"][approver.id.toString()];
  requestor.markModified("connectionRequests");
  await requestor.save();
  return requestor;
}
