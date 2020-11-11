import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "./User";
export interface IPost extends Document {
  title: string;
  text: string;
  image?: string;
  urlLink?:string;
  likes: Array<IUser["_id"]>;
}

const postSchema = new Schema({
  creator_id: { type: [Schema.Types.ObjectId], ref: "User" }, // References object ID of user
  title: String,
  text: String,
  image: { type: String, required: false, default: "default-image"},
  urlLink: {type: String, required: false, default: "url" },
  likes: { type: [Schema.Types.ObjectId] , ref: "User", default: [] }
})

const Post: Model<IPost> = model("Post", postSchema);

export default Post;
