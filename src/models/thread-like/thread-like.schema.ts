import { Schema } from "mongoose";

const ThreadLikeSchema: Schema = new Schema({
  postedByUserId: { type: String, required: true },
  title: {
    type: String,
    required: true,
  }
}, { timestamps: { }} );

export default ThreadLikeSchema;
