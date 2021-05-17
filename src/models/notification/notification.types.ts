import { Document, Model } from "mongoose";

export interface INotification {
  read: boolean;
  type: string;
  message: string;
  link: string;
  originatorId: string;
  targetId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  ConnectionRequest = "connection_request",
  DirectMessage = "direct_message",
  ThreadReply = "thread_reply"
}

export interface INotificationDocument extends INotification, Document {}
export interface INotificationModel extends Model<INotificationDocument> {
  generateNotificationDocument: (data: {
    originatorId: string;
    targetUserId: string;
    notificationType: NotificationType;
    threadId?: string;
  })=> Promise<INotificationDocument>,
  findByIdAndMarkAsRead:(notificationId: string) => Promise<INotificationDocument>
}
