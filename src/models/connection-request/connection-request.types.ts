import { Document, Model } from "mongoose";
export interface IConnectionRequest {
  requestorId: string;
  approverId: string;
}

export interface IConnectionRequestDocument
  extends IConnectionRequest,
    Document {}
export interface IConnectionRequestModel
  extends Model<IConnectionRequestDocument> {}
