import { Document, Model } from "mongoose";
import { IThreadComment } from "../thread-comment/thread-comment.types";
import { IThreadLike } from "../thread-like/thread-like.types";
import { IThreadShare } from "../thread-share/thread-share.types";
import { IThread } from "../thread/thread.types";

export interface IUser {
  firstName: string;
  lastName: string;
  auth: {
    googleId?: string,
    email: string,
    password?: string,
    oauth?: string,
  };
  avatar: Array<{ url: string }>;
  connections: any;
  connectionOf: any;
  threads: {
    started: { [keyof: string]: IThread },
    commented: { [keyof: string]: IThreadComment },
    liked: { [keyof: string]: IThreadLike },
    shared: { [keyof: string]: IThreadShare },
  };
}
export interface IUserRegistrationDetails {
  // This is all the info we need to create a user
  email: string;
  plainTextPassword: string;
  firstName: string;
  lastName: string;
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {
  findOneOrCreateByGoogleId: (this: IUserModel, data: IUser) => Promise<IUserDocument>;
  findByGoogleId: (this: IUserModel, id: string) => Promise<IUserDocument>;
  registerUser: (this: IUserModel, details: IUserRegistrationDetails) => Promise<IUserDocument>;
}
