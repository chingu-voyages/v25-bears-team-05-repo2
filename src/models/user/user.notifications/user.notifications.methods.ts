import { NotificationModel } from "../../notification/notification.model";
import { INotificationDocument } from "../../notification/notification.types";
import { IUserDocument } from "../user.types";

/**
 * @param this instance of user
 * @returns Unread notification documents
 */
export async function getUnreadNotificationsForUserByNotificationIds(
  this: IUserDocument
): Promise<INotificationDocument[]> {
  if (this.notifications.length > 0) {
    const unreadNotificationDocuments = await NotificationModel.find({
      "$and": [{ "read": false }, { "_id": { "$in": this.notifications } }],
    });
    return unreadNotificationDocuments;
  }
  return [];
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
  notificationId: string
) {
  this.notifications = this.notifications.filter((notification) => {
    return notification !== notificationId;
  });
  this.markModified("notifications");
  await NotificationModel.findByIdAndMarkAsRead(notificationId);
  await this.save();
  return this;
}
