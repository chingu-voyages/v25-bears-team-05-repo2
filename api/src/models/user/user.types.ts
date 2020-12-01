import { Document, Model, Mongoose } from "mongoose";
import { IThreadComment } from "../thread-comment/thread-comment.types";
import { IThreadLike } from "../thread-like/thread-like.types";
import { IThreadShare } from "../thread-share/thread-share.types";
import { IThread, IThreadDocument, IThreadPostDetails } from "../thread/thread.types";
import { IUserConnection } from "../user-connection/user-connection.types";
export interface IUserThread {
  started: { [keyof: string]: IThread };
  commented: { [keyof: string]: IThreadComment};
  liked: { [keyof: string]: IThreadLike };
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
  createAndPostThread: (this: IUserDocument, threadDetails: IThreadPostDetails) => Promise<{userData: IUserDocument, threadData: IThreadDocument }>;
  isConnectionOf: (this: IUserDocument, targetId: string) =>  boolean;
}
export interface IUserModel extends Model<IUserDocument> {
  findOneOrCreateByGoogleId: (this: IUserModel, data: IUser) => Promise<IUserDocument>;
  findByGoogleId: (this: IUserModel, id: string) => Promise<IUserDocument>;
  registerUser: (this: IUserModel, details: IUserRegistrationDetails) => Promise<IUserDocument>;
  findByEncryptedEmail: (this: IUserModel, encryptedEmail: string ) => Promise<IUserDocument[]>;
  findOneByEncryptedEmail: (this: IUserModel, encryptedEmail: string ) => Promise<IUserDocument>;
}
