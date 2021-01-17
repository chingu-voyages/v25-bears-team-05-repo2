import { Document, Model, Types } from "mongoose";
import { IThreadReference } from "../thread/thread.types";

export interface IThreadComment {
  postedByUserId: Types.ObjectId;
  content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadCommentReference {
  threadData: IThreadReference,
  commentData: {
    commentId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    contentSnippet: string;
    postedByUserId: Types.ObjectId;
  }
}

export interface IThreadCommentDocument extends IThreadComment, Document { }
export interface IThreadCommentModel extends Model<IThreadCommentDocument> { }
