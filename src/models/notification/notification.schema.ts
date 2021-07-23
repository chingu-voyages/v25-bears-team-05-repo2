import { Schema } from "mongoose";
import {
  findByIdAndMarkAsRead,
  generateNotificationDocument,
} from "./notification.methods";

const NotificationSchema = new Schema(
  {
    read: { type: Boolean, default: false },
    type: String,
    message: String,
    originatorId: { type: String, required: true},
    targetId: { type: String, required: true},
    link: String,
  },
  { timestamps: true }
);

NotificationSchema.statics.generateNotificationDocument =
  generateNotificationDocument;
NotificationSchema.statics.findByIdAndMarkAsRead = findByIdAndMarkAsRead;
export default NotificationSchema;
