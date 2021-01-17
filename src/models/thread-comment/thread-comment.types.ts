import { Document, Model } from "mongoose";
import { IThreadReference } from "../thread/thread.types";

export interface IAttachmentType {
  url: string;
}

export interface IThreadComment {
  postedByUserId: string;
  content: string;
  attachments?: Array<IAttachmentType>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadCommentReference {
  threadData: IThreadReference,
  commentData: {
    commentId: string;
    createdAt: string;
    updatedAt: string;
    contentSnippet: string;
    postedByUserId: string;
  }
}

export interface IThreadCommentDocument extends IThreadComment, Document { }
export interface IThreadCommentModel extends Model<IThreadCommentDocument> { }
