import { Document, Model } from "mongoose";
import { IThreadComment } from "../thread-comment/thread-comment.types";
import { IThreadLikeDocument } from "../thread-like/thread-like.types";
import { IThread, ThreadVisibility } from "../thread/thread.types";
import mongoose from "mongoose";
export interface IThreadShare extends IThread {
  postedByUserId: mongoose.Types.ObjectId;
  threadShareType: string;
  visibility: ThreadVisibility;
  content: {
    thread: IThread,
    html: string,
    hashTags: Array<string>,
    attachments: Array<string>
  };
  comments: { [keyof: string]: IThreadComment };
  likes: { [keyof: string]: IThreadLikeDocument };
  shares: { [keyof: string]: IThreadShare };
}

export interface IThreadShareDocument extends IThreadShare, Document { }
export interface IThreadShareModel extends Model<IThreadShareDocument> { }
