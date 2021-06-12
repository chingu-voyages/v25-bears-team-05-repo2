/* eslint-disable no-invalid-this */
import { NotificationModel } from "../../notification/notification.model";
import { INotificationDocument } from "../../notification/notification.types";
import { IUserDocument } from "../user.types";

/**
 * Returns all notifications where this user is the target
 * @param {IUserDocument} this
 * @return {Promise<INotificationDocument[]>}
 */
export async function getNotifications(
  this: IUserDocument,
): Promise<INotificationDocument[]> {
  return NotificationModel.find({
    "targetId": this.id,
  });
}

/**
 *
 * @param {IUserDocument} this reference to user document
 * @param {string} notificationId
 * @return {Promise<INotificationDocument[]>}
 */
export async function dismissNotification(
  this: IUserDocument,
  notificationId: string,
): Promise<INotificationDocument[]> {
  await NotificationModel.findByIdAndDelete(notificationId);
  this.notifications = this.notifications.filter((notification) =>
    notification !== notificationId,
  );
  this.markModified("notifications");
  await this.save();
  return NotificationModel.find({
    "targetId": this.id,
  });
}
