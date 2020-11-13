import { Document, Model } from "mongoose";
import { IUserDocument } from "../user/user.types";

export enum ThreadType {
  Post = 0,
  Photo = 1,
  Job = 2,
  Article = 3
}

export enum ThreadVisibility {
  Anyone = 0,
  Connections = 1
}

export interface IThread extends Document {
  postedByUser: IUserDocument["_id"];
  threadType: ThreadType;
  visibility: ThreadVisibility;
  content: {
    html: string,
    hashtags: [string],
    attachments: [string]
  };
  comments: {};
  likes: {};
  shares: {};
}

export interface IThreadDocument extends IThread, Document {}
export interface IThreadModel extends Model<IThreadDocument> {}
