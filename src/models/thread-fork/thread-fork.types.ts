import { Document, Model, Types } from "mongoose";
import { IThread, IThreadReference } from "../thread/thread.types";

export interface IThreadForkReference extends IThreadReference {
  threadId: Types.ObjectId;
}

export interface IThreadFork extends IThread {
  isAFolk: true;
}

export interface IThreadForkDocument extends IThreadFork, Document { }
export interface IThreadForkModel extends Model<IThreadForkDocument> { }
