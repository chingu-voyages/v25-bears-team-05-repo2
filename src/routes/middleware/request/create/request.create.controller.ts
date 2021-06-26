/* eslint-disable max-len */

import { getRequestor } from "../get-requestor";
import { ConnectionRequestModel }
  from "../../../../models/connection-request/connection-request.model";

import { NotificationModel } from "../../../../models/notification/notification.model";
import { NotificationType } from "../../../../models/notification/notification.types";
import { dispatchNotificationToSocket } from "../../../../models/notification/notification.methods";
import { UserModel } from "../../../../models/user/user.model";

export const getCreateRequestRequestorApprover = (req: any, res: any, next: any):void => {
  res.locals.approverId = req.params.id;
  res.locals.requestorId = getRequestor(req);
  res.locals.isTeamMate = req.body.isTeamMate;
  next();
};

export const createConnectionRequest =
async (req: any, res: any, next: any):
Promise<void> => {
  try {
    const connectionRequest = await ConnectionRequestModel.generateConnectionRequest({
      requestorId: res.locals.requestorId,
      approverId: res.locals.approverId,
      isTeamMate: res.locals.isTeamMate,
    });
    res.locals.connectionRequest = connectionRequest;
    next();
  } catch (exception) {
    return res
      .status(500)
      .send({ error: "Unable to generate connection request document" });
  }
};

export const generateNotification = async (req: any, res: any, next: any): Promise<void> => {
  if (!res.locals.connectionRequest) {
    return res.status(500).send({ error: "connectionRequest object is not defined" });
  }

  if (res.locals.connectionRequest.requestExists === false) {
    try {
      const notification = await NotificationModel.generateNotificationDocument({
        originatorId: res.locals.requestorId,
        targetUserId: res.locals.approverId,
        notificationType: NotificationType.ConnectionRequest,
      });
      res.locals.notification = notification;
      next();
    } catch (exception) {
      return res.status(500).send({ error: "Unable to generation notification" });
    }
  } else {
    return res.status(400).send({ error: "request already exists" });
  }
};

export const dispatchNotification = (req: any, res: any, next: any): void => {
  const io = req.app.get("socketIo");
  dispatchNotificationToSocket({
    targetUserId: res.locals.approverId,
    io,
    notification: res.locals.notification,
  });
  next();
};

export const refreshAndSendFinalResponseToRequestor = async (req: any, res: any, next: any): Promise<void> => {
  try {
    const refreshedUser = await UserModel.findById(res.locals.requestorId);
    return res
      .status(200)
      .send([refreshedUser.connections, refreshedUser.connectionRequests]);
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
};

