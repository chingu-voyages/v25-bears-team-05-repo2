import { Document, Model } from "mongoose";
import { ThreadVisibility } from "../thread/thread.types";

export interface IAttachmentType {
  url: string;
}

export interface IThreadComment {
  postedByUserId: string;
  content: string;
  attachments?: Array<IAttachmentType>;
  parentThreadId: string;
  parentThreadVisibility: ThreadVisibility;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadCommentDocument extends IThreadComment, Document { }
export interface IThreadCommentModel extends Model<IThreadCommentDocument> { }
