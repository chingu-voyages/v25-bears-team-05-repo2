import { Schema, Types } from "mongoose";
import { getAllPublicThreads, patchThread } from "./thread.methods";

const ThreadSchema: Schema = new Schema({
  postedByUserId: { type: Types.ObjectId, required: true },
  threadType: { type: String, default: "post"},
  visibility: { type: Number, default: 0 },
  content: {
      html: { type: String },
      hashTags: { type: [String], default: [] },
      attachments: { type: [String], default: []}
  },
  comments: {
    type: Schema.Types.Mixed,
    default: { },
    required: true,
  },
  reactions: {
    type: Schema.Types.Mixed,
    default: { },
    required: true,
  },
  forks: {
    type: Schema.Types.Mixed,
    default: { },
    required: true,
  }
}, { timestamps: { }} );

ThreadSchema.statics.getAllPublicThreads = getAllPublicThreads;
ThreadSchema.statics.patchThread = patchThread;
export default ThreadSchema;
