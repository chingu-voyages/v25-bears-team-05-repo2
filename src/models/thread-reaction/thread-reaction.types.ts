import { Document, Model } from "mongoose";

export enum ThreadReactionTypeTitle {
  Star = "star",
  Heart = "heart",
  Processing = "Processing",
}

export interface IThreadReaction {
  postedByUserId: string;
  title: ThreadReactionTypeTitle;
}

export interface IThreadReactionDocument extends IThreadReaction, Document { }
export interface IThreadReactionModel extends Model<IThreadReactionDocument> { }
