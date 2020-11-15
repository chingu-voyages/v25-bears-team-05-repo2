import { Document, Model } from "mongoose";

export interface IAttachmentType {
  url: string;
}

export interface IThreadComment {
  postedByUserId: string;
  content: string;
  attachments?: Array<IAttachmentType>;
}

export interface IThreadCommentDocument extends IThreadComment, Document {}
export interface IThreadCommentModel extends Model<IThreadCommentDocument> {}
