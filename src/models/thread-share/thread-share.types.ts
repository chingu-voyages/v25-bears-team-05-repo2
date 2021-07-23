import { Document, Model } from "mongoose";
import { IThread, ThreadType } from "../thread/thread.types";

export interface IThreadShare extends IThread {
  threadShareType: ThreadType;
}

export interface IThreadShareDocument extends IThreadShare, Document { }
export interface IThreadShareModel extends Model<IThreadShareDocument> { }
