import { Document, Model } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  auth: {
    email?: string,
    password?: string,
    oauth?: string,
  };
  avatar: [ { url: string } ];
  connections: any;
  connectionOf: any;
  threads: {
    started: {},
    commented: {},
    liked: {},
    shared: {},
  };
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}
