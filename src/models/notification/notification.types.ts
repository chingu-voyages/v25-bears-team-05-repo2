import { Document, Model } from "mongoose";

export interface INotification {
  read: boolean;
  type: string;
  message: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {}
export interface INotificationModel extends Model<INotificationDocument> {}
