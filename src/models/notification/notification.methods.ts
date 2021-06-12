/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import { UserModel } from "../user/user.model";
import { NotificationModel } from "./notification.model";
import {
  INotification,
  INotificationDocument,
  INotificationModel,
  NotificationType,
} from "./notification.types";

/**
 * @param {INotificationModel} this reference to notification model
 * @param {object} data Creates a notification document and inserts it into the
 * target user's notification object
 */
export async function generateNotificationDocument(
  this: INotificationModel,
  data: {
    originatorId: string;
    targetUserId: string;
    notificationType: NotificationType;
    threadId?: string;
  },
): Promise<INotificationDocument> {
  const validTargetUser = await UserModel.findById(data.targetUserId);

  if (!validTargetUser) {
    throw new Error(`target user ${data.targetUserId} does not exist`);
  }

  const originator = await UserModel.findById(data.originatorId);
  const fullName = `${originator.firstName || ""} ${originator.lastName || ""}`;
  let message = "null";
  let link = "null";
  switch (data.notificationType) {
  case NotificationType.ConnectionRequest:
    message = `${fullName} would like to add you as a connection`;
    link = `${originator.id.toString()}`;
    break;
  case NotificationType.ConnectionRequestApproved:
    message = `You are now connected to ${fullName}`;
    link = `${originator.id.toString()}`;
    break;
  case NotificationType.DirectMessage:
    message = `${fullName} sent you a direct message`;
    link = `placeholder`;
    break;
  case NotificationType.ThreadReply:
    message = `${fullName} replied to a thread you posted`;
    link = `placeholder`;
    break;
  default:
    throw new Error("Invalid notification type");
  }

  const notification = await NotificationModel.create({
    type: data.notificationType,
    read: false,
    originatorId: originator.id,
    targetId: validTargetUser.id,
    message,
    link,
  });

  validTargetUser.notifications.push(notification.id.toString());
  await validTargetUser.save();
  return notification;
}

/**
 * Sends notification via sockets to target user.
 * @param {object} data
 * @param {object} data.io socket reference
 * @param {string} data.targetUserId (id to send the notification alert to)
 * @param {INotification} data.notification notification to send
 */
export function dispatchNotificationToSocket(data: {
  io: any;
  targetUserId: string;
  notification: INotification;
}): void {
  data.io.to(data.targetUserId).emit("notification", data.notification);
}


export async function findByIdAndMarkAsRead(
  this: INotificationModel,
  data: {
    notificationId: string,
    read: boolean,
  },
): Promise<INotificationDocument> {
  const notification = await NotificationModel.findById(data.notificationId);
  if (notification) {
    notification.read = data.read;
    await notification.save();
    return notification;
  } else {
    throw new Error(`notification with id ${data.notificationId} not found`);
  }
}
