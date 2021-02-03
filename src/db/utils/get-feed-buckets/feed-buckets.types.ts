import { IProfile, IThreadResponse } from "../../types";
import { IThreadComment } from "../../../models/thread-comment/thread-comment.types";
import { IFeedItem } from "../../../models/feed-item/feed-item.types";

export interface IBucketItem extends IFeedItem {
    documentData: IThreadResponse | IProfile | IThreadComment;
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

export interface IGenerateFeedUpdateBucketsProps extends IBaseFeedBucketsProps {
    latestBucketRecieved: string;
}

export interface IGenerateNextFeedBucketsProps extends IBaseFeedBucketsProps {
    oldestBucketRecieved: string;
}

export interface IGetFeedBucketsProps extends IBaseFeedBucketsProps {
    latestBucketRecieved?: string;
    oldestBucketRecieved?: string;
};

export interface IGetFeedItemsFilteredByDestinationProps extends IBaseFeedBucketsProps {
    updatedAt: {
        [selectorName: string]: string;
    };
}