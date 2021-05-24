import { NotificationModel } from "../../notification/notification.model";
import { INotificationDocument } from "../../notification/notification.types";
import { IUserDocument } from "../user.types";

/**
 * Returns all notifications where this user is the target
 * @param this
 */
export async function getNotifications(
  this: IUserDocument,
): Promise<INotificationDocument[]> {
  const notifications = await NotificationModel.find({
    "targetId": this.id,
  });
  return notifications;
}
/**
 * This will remove the notification document id from user's notification array
 * Then go into the Notifications collection and mark the particular notification document
 * as read.
 * @param this
 * @param notificationId
 * @returns
 */
export async function markNotificationAsRead(
  this: IUserDocument,
  notificationId: string,
) {
  this.notifications = this.notifications.filter((notification) => {
    return notification !== notificationId;
  });
  this.markModified("notifications");
  await NotificationModel.findByIdAndMarkAsRead(notificationId);
  await this.save();
  return this;
}
