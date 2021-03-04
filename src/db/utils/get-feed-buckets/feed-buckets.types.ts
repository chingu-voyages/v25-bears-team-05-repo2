import { IProfile, IThreadResponse } from "../../types";
import { IThreadCommentDocument } from "../../../models/thread-comment/thread-comment.types";
import { IFeedItem } from "../../../models/feed-item/feed-item.types";
import { IThreadReactionDocument } from "../../../models/thread-reaction/thread-reaction.types";
import { IUserConnectionDocument } from "../../../models/user-connection/user-connection.types";

export interface IBucketItem extends IFeedItem {
    documentData: IThreadResponse | IProfile | IThreadCommentDocument | IThreadReactionDocument | IUserConnectionDocument;
    destination: "home" | "profile" | "notification";
}

export interface IBucket {
    collection: {
        [priority: number]: Array<IBucketItem>;
    };
    latestUpdate: Date;
    oldestUpdate: Date;
}

export interface IBaseFeedBucketsProps { 
    req: any; 
    limit?: number; 
    destination: IBucketItem["destination"];
}

export interface IGetFeedBucketsProps extends IBaseFeedBucketsProps {
    newerThanDate?: string;
    olderThanDate?: string;
};

export interface IGetFeedItemsFilteredByDestinationProps extends IBaseFeedBucketsProps {
    updatedAt: {
        [selectorName: string]: string;
    };
}