import { Schema } from "mongoose";
import ThreadSchema from "../thread/thread.schema";

const ThreadForkSchema: Schema = new Schema({
  postedByUserId: String,
  threadForkType: String,
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
  reactions: {
    type: Schema.Types.Mixed,
    default: {},
    required: true,
  },
  forks: {
    type: Schema.Types.Mixed,
    default: {},
    required: true,
  },
}, { timestamps: {}});

export default ThreadForkSchema;
