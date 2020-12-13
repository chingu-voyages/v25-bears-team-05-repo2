import { Document, Model } from "mongoose";
import { IAttachmentType, IThreadComment, IThreadCommentDocument } from "../thread-comment/thread-comment.types";
import { IThreadLikeDocument } from "../thread-like/thread-like.types";
import { IThreadShare } from "../thread-share/thread-share.types";
import { IThread, IThreadDocument, IThreadPostDetails } from "../thread/thread.types";
import { IUserConnection } from "../user-connection/user-connection.types";
export interface IUserThread {
  started: { [keyof: string]: IThread };
  commented: { [keyof: string]: { [keyof: string]: IThreadComment }};
  liked: { [keyof: string]: IThreadLikeDocument };
  shared: { [keyof: string]: IThreadShare };
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
  avatar: Array<{ url: string }>;
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
  isConnectionOf: (this: IUserDocument, targetId: string) =>  boolean;
  getConnectionThreads: (this: IUserDocument) => Promise<Array<IThread>>;
  getConnectionOfFromConnections: (this: IUserDocument) => Promise<IUserConnection[]>;
  addLikeToThread: (this: IUserDocument, data: { targetThreadId: string, title: string }) => Promise<{ updatedThread: IThreadDocument,
    threadLikeDocument: IThreadLikeDocument
  }>;
  deleteLikeFromThread: (this: IUserDocument, data: {  targetThreadId: string, targetLikeId: string }) => Promise<{ updatedThread: IThreadDocument}>;
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
}
export interface IUserModel extends Model<IUserDocument> {
  findOneOrCreateByGoogleId: (this: IUserModel, data: IUser) => Promise<IUserDocument>;
  findByGoogleId: (this: IUserModel, id: string) => Promise<IUserDocument>;
  registerUser: (this: IUserModel, details: IUserRegistrationDetails) => Promise<IUserDocument>;
  findByEncryptedEmail: (this: IUserModel, encryptedEmail: string ) => Promise<IUserDocument[]>;
  findOneByEncryptedEmail: (this: IUserModel, encryptedEmail: string ) => Promise<IUserDocument>;
}
