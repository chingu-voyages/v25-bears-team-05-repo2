import { Schema } from "mongoose";

const ThreadLikeSchema: Schema = new Schema({
  postedByUserId: { type: String, required: true },
  threadLikeType: {
    emoji: {
      type: String
    },
    title: {
      type: String
    }
  }
}, { timestamps: {}, strict: false} );

export default ThreadLikeSchema;
