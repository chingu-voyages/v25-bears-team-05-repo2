import { Schema } from "mongoose";

const ThreadSchema: Schema = new Schema({
  postedByUserId: { type: String, required: true },
  threadType: { type: Number, default: 0},
  visibility: { type: Number, default: 0 },
  content: {
      html: String,
      hashtags: [String],
      attachments: [String]
  },
  comments: {},
  likes: {},
  shares: {}
}, { timestamps: {}} );

export default ThreadSchema;
