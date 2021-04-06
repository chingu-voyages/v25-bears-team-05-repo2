import { Document, Model } from "mongoose";

export interface IPasswordRecovery {
  requestId: string | null;
  requestClosedDate: Date | null;
  requestorEmail: string | null;
  requestClaimed: Boolean;
  readonly createdAt: Date;
  updatedAt: Date;
}

// Instance methods
export interface IPasswordRecoveryDocument
  extends IPasswordRecovery,
    Document {}

// Static methods
export interface IPasswordRecoveryModel
  extends Model<IPasswordRecoveryDocument> {}
