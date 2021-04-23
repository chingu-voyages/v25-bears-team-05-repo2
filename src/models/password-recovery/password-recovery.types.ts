import { Document, Model } from "mongoose";

export interface IPasswordRecovery {
  readonly authToken: string | null;
  requestClosedDate?: Date | null;
  requestClosed?: boolean;
  readonly forAccountEmail: string;
  requestIsClaimed?: boolean;
  readonly requestorIpAddress: string | null;
  readonly requestExpiryDate?: Date;
  readonly createdAt?: Date;
  updatedAt: Date;
}

// Instance methods
export interface IPasswordRecoveryDocument
  extends IPasswordRecovery,
    Document {}

// Static methods
export interface IPasswordRecoveryModel
  extends Model<IPasswordRecoveryDocument> {
  findAllRequestsByEmailId: (
    emailId: string
  ) => Promise<IPasswordRecoveryDocument[]>;
  findRequestByEmailAndAuthToken: ({
    emailId,
    authToken,
  }: {
    emailId: string;
    authToken: string;
  }) => Promise<IPasswordRecoveryDocument>;
}
