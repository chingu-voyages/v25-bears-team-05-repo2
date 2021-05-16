import { UserModel } from "../user/user.model";
import { NotificationModel } from "./notification.model";
import {
  INotification,
  INotificationDocument,
  INotificationModel,
  NotificationType,
} from "./notification.types";

/**
 * @param data Creates a notification document and inserts it into the
 * target user's notification object
 */
export async function generateNotificationDocument(
  this: INotificationModel,
  data: {
    originatorId: string;
    targetUserId: string;
    notificationType: NotificationType;
    threadId?: string;
  }
): Promise<INotificationDocument> {
  const validTargetUser = await UserModel.findById(data.targetUserId);

  if (!validTargetUser) {
    throw new Error(`target user ${data.targetUserId} does not exist`);
  }

  const originator = await UserModel.findById(data.originatorId);
  let message = "null";
  let link = "null";
  switch (data.notificationType) {
    case NotificationType.ConnectionRequest:
      message = `${originator.firstName} ${originator.lastName} would like to add you as a connection`;
      link = `${originator.id.toString()}/profile`;
      break;
    case NotificationType.DirectMessage:
      message = `${originator.firstName} ${originator.lastName} sent you a direct message`;
      link = `placeholder`;
      break;
    case NotificationType.ThreadReply:
      message = `${originator.firstName} ${originator.lastName} replied to a thread you posted`;
      link = `placeholder`;
      break;
    default:
      throw new Error("Invalid notification type");
  }

  const notification = await NotificationModel.create({
    type: data.notificationType,
    read: false,
    message,
    link,
  });

  validTargetUser.notifications.push(notification.id.toString());
  validTargetUser.markModified("notifications");
  await validTargetUser.save();
  return notification;
}

/**
 *
 * @param io socket reference
 * @param targetUserId
 */
export function dispatchNotificationToSocket(data: {
  io: any;
  targetUserId: string;
  notification: INotification;
}) {
  data.io.to(data.targetUserId).emit("notification", data.notification.type);
}

export async function findByIdAndMarkAsRead(
  this: INotificationModel,
  notificationId: string
): Promise<INotificationDocument> {
  const notification = await NotificationModel.findById(notificationId);
  if (notification) {
    notification.read = true;
    await notification.save();
    return notification;
  } else {
    throw new Error(`notification with id ${notificationId} not found`);
  }
}
