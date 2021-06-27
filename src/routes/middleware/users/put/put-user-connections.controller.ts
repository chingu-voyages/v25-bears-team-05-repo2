/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable max-len */
import { UserModel } from "../../../../models/user/user.model";
import { ConnectionRequestModel }
  from "../../../../models/connection-request/connection-request.model";
import { getReqUser } from "../../../utils";
import { NotificationModel } from "../../../../models/notification/notification.model";
import { NotificationType } from "../../../../models/notification/notification.types";
import { dispatchNotificationToSocket } from "../../../../models/notification/notification.methods";

export const validateUserIsNotMeOrSelf = (req: any, res: any, next: any): void => {
  const userId = getReqUser(req);
  if (!userId) return res.status(400).send("Cannot determine req.user.id");
  res.locals.userId = userId;
  if (req.params.id === "me" || req.params.id === userId) {
    return res.status(400).send({
      error: "Can't use 'me' or own id in this type of request",
    });
  }
  next();
};

export const getConnectionRequestDocument =
  async (req: any, res: any, next: any):
    Promise<void> => {
    const connectionReqDocumentId = req.body.connectionRequestDocumentId;
    try {
      const connectionRequestDocument = await ConnectionRequestModel.findById(
        connectionReqDocumentId,
      );
      if (!connectionRequestDocument) {
        return res.status(400).send({ error: "request not found or no longer exists" });
      }
      res.locals.connectionRequestDocument = connectionRequestDocument;
      next();
    } catch (exception) {
      return res.status(500)
        .send(`Server error finding connection request document: ${exception.message}`);
    }
  };

export const validateApproverIsReqUser = (req: any, res: any, next: any): void => {
  if (res.locals.connectionRequestDocument.approverId !== res.locals.userId) {
    return res.status(400).send({
      error: "approverId doesn't match req.user.id",
    });
  }
  next();
};

export const validateParamIdIsConnectionRequestDocumentRequestor = (req: any, res: any, next: any): void => {
  if (req.params.id !== res.locals.connectionRequestDocument.requestorId) {
    return res.status(400).send({
      error: "connectionRequestDocument's requestorId does not match req.params.id",
    });
  }
  next();
};

export const addConnectionToUser = async (req: any, res: any, next: any) => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    await user.addConnectionToUser(res.locals.connectionRequestDocument.requestorId,
      res.locals.connectionRequestDocument.isTeamMate);
    next();
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};

export const deleteConnectionRequest = async (req: any, res: any, next: any): Promise<void> => {
  try {
    await ConnectionRequestModel.deleteConnectionRequest({
      requestorId: res.locals.connectionRequestDocument.requestorId,
      approverId: res.locals.connectionRequestDocument.approverId,
    });
    next();
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};

export const generateNotificationDocument = async (req: any, res: any, next: any): Promise<void> => {
  try {
    const notification = await NotificationModel.generateNotificationDocument(
      {
        originatorId: res.locals.connectionRequestDocument.approverId,
        targetUserId: res.locals.connectionRequestDocument.requestorId,
        notificationType: NotificationType.ConnectionRequestApproved,
      },
    );
    res.locals.notification = notification;
    next();
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};

export const dispatchNotification = (req: any, res: any, next: any): void => {
  const io = req.app.get("socketIo");
  dispatchNotificationToSocket({
    targetUserId: res.locals.connectionRequestDocument.requestorId,
    io,
    notification: res.locals.notification,
  });
  next();
};

export const finalizeAndSendRequestorConnections = async (req: any, res: any): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    return res.status(200).send([user.connections]);
  } catch (exception) {
    return res.status(500).send({ error: exception.message });
  }
};
