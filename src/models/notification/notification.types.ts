import { Document, Model } from "mongoose";

export interface INotification {
  read: boolean;
  type: string;
  message: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  ConnectionRequest = "connection_request",
  DirectMessage = "direct_message",
  ThreadReply = "thread_reply"
}

export interface INotificationDocument extends INotification, Document {}
export interface INotificationModel extends Model<INotificationDocument> {}
