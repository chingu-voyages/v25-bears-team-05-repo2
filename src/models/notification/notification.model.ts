import { model } from "mongoose";
import {
  INotificationDocument,
  INotificationModel,
} from "./notification.types";
import NotificationSchema from "./notification.schema";

export const NotificationModel = model<
  INotificationDocument,
  INotificationModel
>("notifications", NotificationSchema);
