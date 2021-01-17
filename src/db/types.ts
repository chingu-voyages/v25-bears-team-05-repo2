import { IThreadFork } from "../models/thread-fork/thread-fork.types";
import { ThreadReactionTypeTitle } from "../models/thread-reaction/thread-reaction.types";
import { ThreadVisibility } from "../models/thread/thread.types";
import { Types } from "mongoose";

export interface IProfileConnection {
  userId: string | Types.ObjectId;
  dateTimeConnected: string | Date;
  isTeamMate: boolean;
}

export interface IProfileThreadsReference {
  threadId: string | Types.ObjectId;
  createdAt: string | Date;
  updatedAt: string | Date;
  contentSnippet: string;
  postedByUserId: string | Types.ObjectId;
}

export interface IProfileThreadsCommentReference {
  threadData: IProfileThreadsReference;
  commentData: {
    commentId: string | Types.ObjectId;
    createdAt: string | Date;
    updatedAt: string | Date;
    contentSnippet: string;
    postedByUserId: string | Types.ObjectId;
  };
}

export interface IProfileThreadsReactionReference {
  threadData: IProfileThreadsReference;
  reactionData: {
    reactionId: string | Types.ObjectId;
    postedByUserId: string | Types.ObjectId;
    title: ThreadReactionTypeTitle;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
}

export interface IProfile {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatarUrls: Array<{url: string}>;
  nOfConnections: number;
  isAConnection: boolean;
  connections: { [userId: string]: IProfileConnection };
  connectionOf: { [userId: string]: IProfileConnection };
  threads: {
    started: { [threadId: string]: IProfileThreadsReference };
    commented: { [threadId: string]: { [commentId: string]: IProfileThreadsCommentReference }};
    reacted: { [threadId: string]: { [reactionId: string]: IProfileThreadsReactionReference } };
  };
  isCurrentUser: boolean;
  updatedAt: string;
  createdAt: string;
}
