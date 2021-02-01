import { Schema, Types } from "mongoose";
import { getAllPublicThreads, patchThread } from "./thread.methods";

const ThreadSchema: Schema = new Schema({
  postedByUserId: { type: Types.ObjectId, required: true },
  threadType: { type: String, default: "post"},
  visibility: { type: Number, default: 0 },
  content: {
      html: { type: String }
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
  },
  isAFork: {
    type: Boolean,
    default: false
  }
}, { timestamps: { }} );

ThreadSchema.index({ "content.html": "text", "comments": "text" });
ThreadSchema.statics.getAllPublicThreads = getAllPublicThreads;
ThreadSchema.statics.patchThread = patchThread;
export default ThreadSchema;
