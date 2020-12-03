import { Schema } from "mongoose";
import ThreadSchema from "../thread/thread.schema";

const ThreadShareSchema: Schema = new Schema({
  postedByUserId: String,
  threadShareType: String,
  visibility: Number,
  content: {
    thread: ThreadSchema,
    html: { type: String },
    hashTags: { type: [String], default: [] },
    attachments: { type: [String], default: [] }
  },
  comments: {
    type: Schema.Types.Mixed,
    default: {},
    required: true,
  },
  likes: {
    type: Schema.Types.Mixed,
    default: {},
    required: true,
  },
  shares: {
    type: Schema.Types.Mixed,
    default: {},
    required: true,
  },
}, { timestamps: {}});

export default ThreadShareSchema;
