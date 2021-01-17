import { Document, Model } from "mongoose";
import { IThread, IThreadReference } from "../thread/thread.types";

export interface IThreadForkReference extends IThreadReference {}

export interface IThreadFork extends IThread {
  isAFolk: true;
}

export interface IThreadForkDocument extends IThreadFork, Document { }
export interface IThreadForkModel extends Model<IThreadForkDocument> { }
