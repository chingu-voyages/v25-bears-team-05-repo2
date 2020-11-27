import { IThreadComment } from "../models/thread-comment/thread-comment.types";
import { IThreadLike } from "../models/thread-like/thread-like.types";
import { IThreadShare } from "../models/thread-share/thread-share.types";
import { IThread } from "../models/thread/thread.types";

export interface IProfile {
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatar: Array<{ url: string}>;
  connections: any;
  connectionOf: any;
  threads: {
    started: { [keyof: string]: IThread },
    commented: { [keyof: string]: IThreadComment },
    liked: { [keyof: string]: IThreadLike },
    shared: { [keyof: string]: IThreadShare },
  };
  id: string;
}
