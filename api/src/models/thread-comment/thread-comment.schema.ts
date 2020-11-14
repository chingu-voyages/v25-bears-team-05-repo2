import { Schema } from "mongoose";


const ThreadCommentSchema: Schema = new Schema({
  postedByUserId: String,
  content: String,
  attachments: {
    type: [{ url: String }] ,
    required: false,
    default: []
  }
});

export default ThreadCommentSchema;
