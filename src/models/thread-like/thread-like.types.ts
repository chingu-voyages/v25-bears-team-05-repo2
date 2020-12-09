import { Document, Model } from "mongoose";

export enum ThreadLikeTypeTitle {
  Star = "star",
  Heart = "heart",
  Processing = "Processing",
}

export interface IThreadLike {
  postedByUserId: string;
  threadLikeType: {
    emoji: string,
    title: ThreadLikeTypeTitle
  };
}

export interface IThreadLikeDocument extends IThreadLike, Document {}
export interface IThreadLikeModel extends Model<IThreadLikeDocument> {}
