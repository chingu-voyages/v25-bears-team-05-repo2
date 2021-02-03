import { Model, Types, Document } from "mongoose";

export type TFeedDocumentType = "thread" | "user" | "comment" | "connection" | "reaction";

export type TFeedChangeSummeryAction = "posted" | "updated" | "commented" | "updated their comment" | "reacted to" | "connected with" | "no action defined";

export interface IFeedItem {
    documentId: Types.ObjectId;
    documentType: TFeedDocumentType;
    documentUpdateAt: Date;
    action: TFeedChangeSummeryAction;
    byUserId: Types.ObjectId;
    propertiesChanged: {
        [propertyName: string]: string;
    };
}

export interface IAnyTimeStampedDocument {
    updatedAt: Date;
    [keyof: string]: any;
}
export interface IAnyTimeStampedDocumentWithPostedByUserId extends IAnyTimeStampedDocument {
    postedByUserId: Types.ObjectId;
}
export interface IAnyTimeStampedDocumentWithUserId extends IAnyTimeStampedDocument  {
    userId: Types.ObjectId;
}

export type TDocumentForTheFeed = IAnyTimeStampedDocumentWithPostedByUserId | IAnyTimeStampedDocumentWithUserId;

export interface IFeedItemDocument extends IFeedItem, Document { }
export interface IFeedItemModel extends Model<IFeedItemDocument> { }