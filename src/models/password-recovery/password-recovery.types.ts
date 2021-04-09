import { Document, Model } from "mongoose";

export interface IPasswordRecovery {
  authToken: string | null;
  requestClosedDate: Date | null;
  forAccountEmail: string | null;
  requestIsClaimed: Boolean;
  requestorIpAddress: string | null;
  requestExpiryDate: Date;
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
