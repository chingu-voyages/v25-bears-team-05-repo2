import { Document, Model, Types } from "mongoose";

export interface Avatar {
  url: string;
}

export interface IUserConnection {
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatarUrls: Array<Avatar>;
  userId: Types.ObjectId;
  isTeamMate: boolean;
  dateTimeConnected: Date;
}

export interface IUserConnectionDocument extends IUserConnection, Document {}
export interface IUserConnectionModel extends Model<IUserConnectionDocument> {}
