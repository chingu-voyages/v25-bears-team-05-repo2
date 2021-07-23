import { Schema } from "mongoose";

const ThreadCommentSchema: Schema = new Schema(
  {
    postedByUserId: { type: String, required: true },
    content: { type: String, required: true },
    parentThreadId: String,
    parentThreadVisibility: { type: Number, default: 0, required: true },
    parentThreadOriginatorId: String,
    attachments: {
      type: [{ url: String }],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

ThreadCommentSchema.index({ "content": "text" });
export default ThreadCommentSchema;
