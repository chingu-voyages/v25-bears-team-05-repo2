import { Document, Model, model, Schema } from "mongoose";
import { IPost } from "./post";
/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param password:string
 * @param avatar:string
 */
export interface IUser extends Document {
  email: string;
  password: string;
  avatar: string;
  posts: Array<IPost["_id"]>
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  posts: {
    type: [Schema.Types.ObjectId], default: []
  }
});

const User: Model<IUser> = model("User", userSchema);

export default User;
