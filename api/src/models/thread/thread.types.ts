import { Document, Model } from "mongoose";
import { IThreadComment, IThreadCommentModel } from "../thread-comment/thread-comment.types";
import { IThreadLike } from "../thread-like/thread-like.types";
import { IThreadShare } from "../thread-share/thread-share.types";

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

export interface IThread {
  postedByUserId: string;
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
}

export interface IThreadDocument extends IThread, Document {}
export interface IThreadModel extends Model<IThreadDocument> {}
