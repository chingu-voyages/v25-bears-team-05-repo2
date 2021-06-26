/* eslint-disable max-len */
import { getRequestor } from "../get-requestor";
import { ConnectionRequestModel }
  from "../../../../models/connection-request/connection-request.model";

export const getDeleteRequestorApprover = (req: any, res: any, next: any): void => {
  if (req.body.origin === "requestor") {
    res.locals.requestorId = getRequestor(req);
    res.locals.approverId = req.params.id;
  } else if (req.body.origin === "approver") {
    res.locals.requestorId = req.params.id;
    res.locals.approverId = getRequestor(req);
  } else {
    return res
      .status(400)
      .send({
        error:
          // eslint-disable-next-line max-len
          `The value for req.body.origin is invalid. It should be either 'requestor' or 'approver'`,
      });
  }
  next();
};

export const deleteRequest = async (_req: any, res: any): Promise<any> => {
  try {
    const refreshedRequestingUser =
    await ConnectionRequestModel.deleteConnectionRequest({
      requestorId: res.locals.requestorId,
      approverId: res.locals.approverId,
    });
    return res
      .status(200)
      .send([
        refreshedRequestingUser.connections,
        refreshedRequestingUser.connectionRequests,
      ]);
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
};
