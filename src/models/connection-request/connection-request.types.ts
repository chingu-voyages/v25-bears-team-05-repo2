import { Document, Model } from "mongoose";
import { IUserDocument } from "../user/user.types";
export interface IConnectionRequest {
  requestorId: string;
  approverId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConnectionRequestDocument
  extends IConnectionRequest,
    Document {}
export interface IConnectionRequestModel
  extends Model<IConnectionRequestDocument> {
  generateConnectionRequest: (
    this: IConnectionRequestModel,
    data: { requestorId: string; approverId: string }
  ) => Promise<{
    document: IConnectionRequestDocument;
    requestExists: boolean;
  }>;
  deleteConnectionRequest: (
    this: IConnectionRequestModel,
    data: { requestorId: string; approverId: string }
  )=> Promise<IUserDocument>
}
