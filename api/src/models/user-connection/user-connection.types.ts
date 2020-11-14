import { Document, Model } from "mongoose";

interface Avatar {
  url: string;
}

export interface IUserConnection extends Document {
  firstName: string;
  lastName: string;
  avatar: Array<Avatar>;
  isTeamMate: boolean;
}

export interface IUserConnectionDocument extends IUserConnection, Document {}
export interface IUserConnectionModel extends Model<IUserConnectionDocument> {}
