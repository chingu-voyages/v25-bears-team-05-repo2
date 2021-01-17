import { Document, Model } from "mongoose";
import { IThreadReference } from "../thread/thread.types";

export enum ThreadReactionTypeTitle {
  Star = "star",
  Heart = "heart",
  Processing = "Processing",
}

export interface IThreadReaction {
  postedByUserId: string;
  title: ThreadReactionTypeTitle;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadReactionReference {
  threadData: IThreadReference,
  reactionData: {
    reactionId: string;
    postedByUserId: string;
    title: ThreadReactionTypeTitle;
    createdAt: string;
    updatedAt: string;
  }
}

export interface IThreadReactionDocument extends IThreadReaction, Document { }
export interface IThreadReactionModel extends Model<IThreadReactionDocument> { }
