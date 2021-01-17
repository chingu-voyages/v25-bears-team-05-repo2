import { IThreadCommentReference } from "../models/thread-comment/thread-comment.types";
import { IThreadReactionReference } from "../models/thread-reaction/thread-reaction.types";
import { IThreadReference } from "../models/thread/thread.types";
import { IUserConnection } from "../models/user-connection/user-connection.types";

export interface IProfile {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatarUrls: Array<{url: string}>;
  nOfConnections: number;
  isAConnection: boolean;
  connections: { [userId: string]: IUserConnection };
  connectionOf: { [userId: string]: IUserConnection };
  threads: {
    started: { [threadId: string]: IThreadReference };
    commented: { [threadId: string]: { [commentId: string]: IThreadCommentReference }};
    reacted: { [threadId: string]: { [reactionId: string]: IThreadReactionReference } };
  };
  isCurrentUser: boolean;
}