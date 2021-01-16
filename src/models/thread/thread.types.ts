import { Document, Model } from "mongoose";
import { IThreadComment } from "../thread-comment/thread-comment.types";
import { IThreadReactionDocument } from "../thread-reaction/thread-reaction.types";
import mongoose from "mongoose";
import { IThreadFork } from "../thread-fork/thread-fork.types";

export enum ThreadType {
  Post = "post",
  Photo = "photo",
  Job = "job",
  Article = "article"
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
  reactions: { [keyof: string]: IThreadReactionDocument };
  forks: { [keyof: string]: IThreadFork };
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadPatchData {
  threadId: string;
  userId: string;
  threadType?: ThreadType;
  visibility?: ThreadVisibility;
  htmlContent?: string;
  hashTags?: Array<string>;
  attachments?: Array<string>;
}

export interface IThreadDocument extends IThread, Document { }
export interface IThreadModel extends Model<IThreadDocument> {
  getAllPublicThreads: (this: IThreadModel, excludeUserIds?: string[]) => Promise<IThreadDocument[]>;
  patchThread: (this: IThreadModel, data: IThreadPatchData) => Promise<IThreadDocument>;
}
