import { Schema } from "mongoose";

const ThreadReactionSchema: Schema = new Schema({
  postedByUserId: { type: String, required: true },
  title: {
    type: String,
    required: true,
  }
}, { timestamps: { }} );

export default ThreadReactionSchema;
