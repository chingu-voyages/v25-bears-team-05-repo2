import { IUserConnection } from "../models/user-connection/user-connection.types";
import { IUserThreadsReference } from "../models/user/user.types";
import { IUserThreadsReactionReference } from "../models/user/user.types";
import { IUserThreadsCommentReference } from "../models/user/user.types";

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
    started: { [threadId: string]: IUserThreadsReference };
    commented: { [threadId: string]: { [commentId: string]: IUserThreadsCommentReference }};
    reacted: { [threadId: string]: { [reactionId: string]: IUserThreadsReactionReference } };
  };
  isMe: boolean;
}