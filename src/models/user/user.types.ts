import { Document, Model } from "mongoose";
import { IAttachmentType, IThreadCommentDocument } from "../thread-comment/thread-comment.types";
import { IThreadReactionDocument } from "../thread-reaction/thread-reaction.types";
import { IThreadFork } from "../thread-fork/thread-fork.types";
import { IThread, IThreadDocument, IThreadPostDetails, ThreadType, ThreadVisibility } from "../thread/thread.types";
import { IUserConnection } from "../user-connection/user-connection.types";
import { ThreadReactionTypeTitle } from "../thread-reaction/thread-reaction.types";

export interface IUserThreadsReference {
  threadId: string;
  createdAt: string;
  updatedAt: string;
  contentSnippet: string;
}

export interface IUserThreadsCommentReference extends IUserThreadsReference{
  commentId: string;
}

export interface IUserThreadsReactionReference extends IUserThreadsReference {
  reactionId: string;
  title: ThreadReactionTypeTitle;
}

export interface IUserThread {
  started: { [threadId: string]: IUserThreadsReference };
  commented: { [threadId: string]: { [commentId: string]: IUserThreadsCommentReference }};
  reacted: { [threadId: string]: { [reactionId: string]: IUserThreadsReactionReference } };
}

export interface IUser {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  auth: {
    googleId?: string,
    email: string,
    password?: string,
    oauth?: string,
  };
  avatarUrls: Array<{ url: string }>;
  connections: { [keyof: string]: IUserConnection };
  connectionOf: { [keyof: string]: IUserConnection };
  threads: IUserThread;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
export interface IUserRegistrationDetails {
  // This is all the info we need to create a user
  encryptedEmail: string;
  plainTextPassword: string;
  firstName: string;
  lastName: string;
}
export interface IProfileData {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export interface IUserDocument extends IUser, Document {
  addConnectionToUser: (this: IUserDocument,  objId: string, isTeamMate?: boolean) => Promise<IUserDocument>;
  deleteConnectionFromUser: (this: IUserDocument,  objId: string) => Promise<IUserDocument>;
  updateUserProfile: (this: IUserDocument, profileData: IProfileData) => Promise<IUserDocument>;
  createAndPostThread: (this: IUserDocument, threadDetails: IThreadPostDetails) => Promise<{ userData: IUserDocument, threadData: IThreadDocument }>;
  deleteThread: (this: IUserDocument, threadDetails: {
    targetThreadId: string;
}) => Promise<{
  [keyof: string]: IThreadDocument;
}>;
  isConnectionOf: (this: IUserDocument, targetId: string) =>  boolean;
  getConnectionThreads: (this: IUserDocument) => Promise<Array<IThread>>;
  getConnectionOfFromConnections: (this: IUserDocument) => Promise<IUserConnection[]>;
  addReactionToThread: (this: IUserDocument, data: { targetThreadId: string, title: string }) => Promise<{ updatedThread: IThreadDocument,
    threadReactionDocument: IThreadReactionDocument
  }>;
  deleteReactionFromThread: (this: IUserDocument, data: {  targetThreadId: string, targetReactionId: string }) => Promise<{ updatedThread: IThreadDocument}>;
  addThreadComment: (this: IUserDocument, data: {
    targetThreadId: string;
    threadCommentData: {
        content: string;
        attachments?: Array<IAttachmentType>;
    };
}) => Promise<{
    updatedThread: IThreadDocument;
    newComment: IThreadCommentDocument;
}>;
deleteThreadComment: (this: IUserDocument, data: {
  targetThreadId: string;
  targetThreadCommentId: string;
}) => Promise<{
  updatedThread: IThreadDocument;
}>;
forkThread: (this: IUserDocument, data: {
  targetThreadId: string;
  sourceUserId: string;
  threadForkType: ThreadType;
  visibility?: ThreadVisibility
}) => Promise<{
  updatedForkedThreads: {
      [keyof: string]: IThreadFork;
  };
  updatedThreadDocument: IThreadDocument}>;

deleteThreadFork: (this: IUserDocument, data: { targetThreadForkId: string }) => Promise<{
  updatedForkedThreads: {
      [keyof: string]: IThreadFork;
  };
  updatedThreadDocument: IThreadDocument}>;
}
export interface IUserModel extends Model<IUserDocument> {
  findOneOrCreateByGoogleId: (this: IUserModel, data: IUser) => Promise<IUserDocument>;
  findByGoogleId: (this: IUserModel, id: string) => Promise<IUserDocument>;
  registerUser: (this: IUserModel, details: IUserRegistrationDetails) => Promise<IUserDocument>;
  findByEncryptedEmail: (this: IUserModel, encryptedEmail: string ) => Promise<IUserDocument[]>;
  findOneByEncryptedEmail: (this: IUserModel, encryptedEmail: string ) => Promise<IUserDocument>;
}
