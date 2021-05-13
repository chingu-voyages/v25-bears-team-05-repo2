import { Schema } from "mongoose";

const NotificationSchema = new Schema ({
  read: { type: Boolean, default: false },
  type: String,
  message: String,
  link: String
}, { timestamps: true });

export default NotificationSchema;
