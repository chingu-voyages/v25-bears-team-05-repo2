import { Model, Types, Document } from "mongoose";
import { IProfile, IThreadResponse } from "../../db/types";
import { IThreadComment } from "../thread-comment/thread-comment.types";

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

export interface IBucketItem extends IFeedItem {
    documentData: IThreadResponse | IProfile | IThreadComment;
    destination: "home feed" | "profile feed" | "notification feed";
}

export interface IBucket {
    collection: {
        [priority: number]: Array<IBucketItem>;
    };
    latestUpdate: Date;
    oldestUpdate: Date;
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