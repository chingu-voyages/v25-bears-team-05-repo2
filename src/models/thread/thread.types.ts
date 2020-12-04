import { Document, Model } from "mongoose";
import { IThreadComment } from "../thread-comment/thread-comment.types";
import { IThreadLike } from "../thread-like/thread-like.types";
import { IThreadShare } from "../thread-share/thread-share.types";
import mongoose from "mongoose";

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

export interface IThreadPostDetails {
  threadType?: ThreadType;
  visibility?: ThreadVisibility;
  html: string;
  hashTags?: Array<string>;
  attachments?: Array<string>;
}

export interface IThread {
  postedByUserId: mongoose.Types.ObjectId;
  threadType: ThreadType;
  visibility: ThreadVisibility;
  content: {
    html: string,
    hashTags: Array<string>,
    attachments: Array<string>
  };
  comments: { [keyof: string]: IThreadComment };
  likes: { [keyof: string]: IThreadLike };
  shares: { [keyof: string]: IThreadShare };
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadDocument extends IThread, Document {}
export interface IThreadModel extends Model<IThreadDocument> {}
