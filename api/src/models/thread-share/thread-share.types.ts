import { Document, Model } from "mongoose";
import { IThread, ThreadVisibility } from "../thread/thread.types";

export interface IThreadShare {
  postedByUserId: string;
  threadShareType: string;
  visibility: ThreadVisibility;
  content: {
    thread: IThread,
    html: string,
    hashTags: Array<string> | [],
  };
  comments: {};
  likes: {};
  shares: {};
}
