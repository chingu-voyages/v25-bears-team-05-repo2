import { Document, Model } from "mongoose";
import { IThread, ThreadType } from "../thread/thread.types";

export interface IThreadFork extends IThread {
  threadForkType: ThreadType;
}

export interface IThreadForkDocument extends IThreadFork, Document { }
export interface IThreadForkModel extends Model<IThreadForkDocument> { }
