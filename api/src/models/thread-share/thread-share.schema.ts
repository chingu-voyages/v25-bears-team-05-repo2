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
  comments: {},
  likes: {},
  shares: {},
}, { timestamps: {}});

export default ThreadShareSchema;
