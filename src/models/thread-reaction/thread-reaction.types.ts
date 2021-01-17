import { Document, Model, Types } from "mongoose";
import { IThreadReference } from "../thread/thread.types";

export enum ThreadReactionTypeTitle {
  Star = "star",
  Heart = "heart",
  Processing = "Processing",
}

export interface IThreadReaction {
  postedByUserId: Types.ObjectId;
  title: ThreadReactionTypeTitle;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IThreadReactionReference {
  threadData: IThreadReference,
  reactionData: {
    reactionId: Types.ObjectId;
    postedByUserId: Types.ObjectId;
    title: ThreadReactionTypeTitle;
    createdAt: Date;
    updatedAt: Date;
  }
}

export interface IThreadReactionDocument extends IThreadReaction, Document { }
export interface IThreadReactionModel extends Model<IThreadReactionDocument> { }
