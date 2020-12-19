import { Document, Model } from "mongoose";
import { IThread } from "../thread/thread.types";

export interface IThreadShare extends IThread {
  threadShareType: ThreadShareType;
}

export enum ThreadShareType {
  Post = "post",
  Photo = "photo",
  Job = "job",
  Article = "article"
}

export interface IThreadShareDocument extends IThreadShare, Document { }
export interface IThreadShareModel extends Model<IThreadShareDocument> { }
