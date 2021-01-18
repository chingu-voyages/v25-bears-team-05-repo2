import { Schema } from "mongoose";


const ThreadCommentSchema: Schema = new Schema({
  postedByUserId: String,
  content: String
}, { timestamps: { }});

export default ThreadCommentSchema;
