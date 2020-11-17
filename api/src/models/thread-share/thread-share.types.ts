import { Document, Model } from "mongoose";
import { IThreadComment } from "../thread-comment/thread-comment.types";
import { IThreadLike } from "../thread-like/thread-like.types";
import { IThread, ThreadVisibility } from "../thread/thread.types";

export interface IThreadShare {
  postedByUserId: string;
  threadShareType: string;
  visibility: ThreadVisibility;
  content: {
    thread: IThread,
    html: string,
    hashTags: Array<string>,
    attachments: Array<string>
  };
  comments: { [keyof: string]: IThreadComment };
  likes: { [keyof: string]: IThreadLike };
  shares: { [keyof: string]: IThreadShare };
}

export interface IThreadShareDocument extends IThreadShare, Document {}
export interface IThreadShareModel extends Model<IThreadShareDocument> {}
