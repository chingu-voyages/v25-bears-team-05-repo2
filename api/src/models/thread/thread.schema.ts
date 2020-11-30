import { Schema, SchemaType, Types } from "mongoose";

const ThreadSchema: Schema = new Schema({
  postedByUserId: { type: Types.ObjectId, required: true },
  threadType: { type: Number, default: 0},
  visibility: { type: Number, default: 0 },
  content: {
      html: String,
      hashtags: [String],
      attachments: [String]
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
  }
}, { timestamps: {}} );

export default ThreadSchema;
