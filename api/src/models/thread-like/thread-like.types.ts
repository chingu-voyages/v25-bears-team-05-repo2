import { Document, Model } from "mongoose";

export enum ThreadLikeTypeTitle {
  Like = "like",
  Celebrate = "celebrate",
  Love = "love"
}

export interface IThreadLike extends Document {
  postedByUserId: string;
  threadLikeType: {
    emoji: string,
    title: ThreadLikeTypeTitle
  };
}

export interface IThreadLikeDocument extends IThreadLike, Document {}
export interface IThreadLikeModel extends Model<IThreadLikeDocument> {}
