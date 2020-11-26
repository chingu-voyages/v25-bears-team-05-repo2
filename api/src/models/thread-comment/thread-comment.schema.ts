import { Schema } from "mongoose";


const ThreadCommentSchema: Schema = new Schema({
  postedByUserId: String,
  content: String,
  attachments: {
    type: [{ url: String }] ,
    required: false,
    default: []
  }
}, { timestamps: {}, strict: false} );

export default ThreadCommentSchema;
