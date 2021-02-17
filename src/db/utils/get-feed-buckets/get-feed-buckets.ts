import { FeedItemModel } from "../../../models/feed-item/feed-item.model";
import { getThreadById } from "../get-thread-by-id/get-thread-by-id";
import { getProfileById } from "../get-profile-by-id/get-profile-by-id";
import { IFeedItem, IFeedItemDocument, TFeedDocumentType } from "../../../models/feed-item/feed-item.types";
import { IUserDocument } from "../../../models/user/user.types";
import { getCommentById } from "../get-comment-by-id/get-comment-by-id";
import { IThreadResponse } from "../../types";
import { IBucket, IBucketItem, IGenerateFeedUpdateBucketsProps, IGenerateNextFeedBucketsProps, IGetFeedBucketsProps, IGetFeedItemsFilteredByDestinationProps } from "./feed-buckets.types";

function calculateBucketPriority({item, reqUserData, documentData}: {item: IFeedItemDocument, reqUserData: IUserDocument, documentData: IBucketItem["documentData"]}) {
    let priority = 0;
    const isByAConnection = Object.values(reqUserData.connections).map(({userId}) => userId).includes(item.byUserId);
    if (isByAConnection) {
        priority += 50;
    }
    switch(item.action) {
        case "posted": {
            priority += 50;
            break;
        }
        case "updated": {
            priority += 30;
            break;
        }
        case "commented": {
            priority += 40;
            break;
        }
        case "updated their comment": {
            break;
        }
        case "reacted to": {
            break;
        }
        case "connected with": {
            break;
        }
    }
    switch (item.documentType) {
        case "thread": {
        const threadPostedByCurrentUser = (documentData as IThreadResponse).postedByUserId.toString() === reqUserData._id;
        if (threadPostedByCurrentUser) {
            priority += 50;
        }
        const threadCurrentUserHasCommentedOn = Object.keys(reqUserData.threads.commented).includes(item.documentId.toString());
        if (threadCurrentUserHasCommentedOn) {
            priority += 40;
        }
        const threadCurrentUserHasReactedTo = Object.keys(reqUserData.threads.reacted).includes(item.documentId.toString());
        if (threadCurrentUserHasReactedTo) {
            priority += 30;
        }
        }
        case "comment": {
        const commentIsOnThreadPostedByCurrentUser = Object.keys(reqUserData.threads.started).includes(item.documentId.toString());
        if (commentIsOnThreadPostedByCurrentUser) {
            priority += 40;
        }
        }
        case "user": {
        const userIsAConnection = Object.values(reqUserData.connections).map(({userId}) => userId).includes(item.documentId);
        if (userIsAConnection) {
            priority += 40;
        }
        }
    }
    return priority;
}

async function getDocumentData({documentType, documentId, reqUserId}: {documentType: TFeedDocumentType, documentId: IFeedItem["documentId"], reqUserId: string}) {
    let documentData;
    switch(documentType) {
        case "thread": {
            documentData = await getThreadById({ threadId: documentId.toString(), reqUserId });
            break;
        }
        case "comment": {
            documentData = await getCommentById({ commentId: documentId.toString() });
            break;
        }
        case "user": {
            documentData = await getProfileById({ userId: documentId.toString(), reqUserId });
            break;
        }
    }
    return documentData
}

async function createBucket({feedItems, req, destination}: {feedItems: IFeedItemDocument[], req: any, destination: IBucketItem["destination"]}) {
    const reqUserData = (req.user as IUserDocument);
    const reqUserId = reqUserData._id;
    const collection: IBucket["collection"] = {};
    let latestUpdate: Date;
    let oldestUpdate: Date;
    await Promise.all(feedItems.map(async (item) => {
        item = item.toObject();
        const {documentType, documentId, documentUpdatedAt} = item;
        if (!latestUpdate || documentUpdatedAt > latestUpdate) {
            latestUpdate = documentUpdatedAt;
        }
        if (!oldestUpdate || documentUpdatedAt < oldestUpdate) {
            oldestUpdate = documentUpdatedAt;
        }
        // transform each item to bucketItem by attaching documentData
        const documentData: IBucketItem["documentData"] = await getDocumentData({documentType, documentId, reqUserId});
        // make collection by sorting into priority groups
        const priority = calculateBucketPriority({item, reqUserData, documentData});
        const bucketItem = {...item, documentData, destination};
        collection[priority] = [...(collection[priority] || []), bucketItem];
    }));

    return {
        collection,
        latestUpdate,
        oldestUpdate,
    }
}

async function getFeedItemsFilteredByDestination({destination, req, updatedAt, limit = 20}: IGetFeedItemsFilteredByDestinationProps) {
    const reqUserData = (req.user as IUserDocument);
    const reqUserId = reqUserData._id;
    let preFilter = {};
    switch(destination) {
        case "home": {
            preFilter = { 
                $or: [
                    { $and: [ 
                        { documentType: { $in: ["thread"] } }, 
                        { 
                            $or: [
                                { action: { $in: [ "posted" ] } }, // threads posted by anyone
                                { $and: [ // thread updates only by connections or a thread current user has interacted with
                                    { action: { $in: ["updated", "commented", "reacted to" ] } },
                                    { $or: [
                                        { postedByUserId: { $in: [ ...Object.keys(reqUserData.connections)] } },
                                        { documentId: { $in: [ ...Object.keys(reqUserData.threads.commented), ...Object.keys(reqUserData.threads.reacted) ] } }
                                    ] }
                                ]},
                            ]
                        }
                    ] },
                    { $and: [
                        { documentType: { $in: ["comment"] } }, 
                        { $and: [ // only comments and comment updates by a connection or from a thread current user has interacted with
                            { action: { $in: ["commented", "updated their comment"] } },
                            { $or: [
                                { postedByUserId: { $in: [ ...Object.keys(reqUserData.connections)] } },
                                { documentId: { $in: [ ...Object.keys(reqUserData.threads.commented), ...Object.keys(reqUserData.threads.reacted) ] } }
                            ] },
                        ] },
                    ]},
                    { $and: [
                        { documentType: { $in: ["connection"] } }, 
                        { postedByUserId: { $in: [ ...Object.keys(reqUserData.connections)] } }, // only connetions made by a connection
                    ]},
                    { $and: [
                        { documentType: { $in: ["reaction"] } }, 
                        { postedByUserId: { $in: [ ...Object.keys(reqUserData.connections)] } }, // only reactions made by a connection
                    ]},
                ]
            }
            break;
        }
        case "profile": {
            preFilter = { postedByUserId: { $eq: reqUserId }, documentType: { $in: ["thread", "comment", "connection", "reaction"] } }
            break;
        }
        case "notification": {
            preFilter = { 
                postedByUserId: { $ne: reqUserId }, 
                documentType: {$in: ["comment", "reaction"] }, 
                action: { $in: ["commented", "reaction", "updated their comment" ] },
                documentId: { $in: [ ...Object.keys(reqUserData.threads.started) ] }

            };
            break;
        }
    }

    const feedItems = await FeedItemModel.find({ updatedAt, ...preFilter}).sort({'updateAt': -1}).limit(limit).exec();
    return feedItems;
}

async function generateFeedUpdateBuckets({latestBucketRecieved, req, limit, destination}: IGenerateFeedUpdateBucketsProps) {
    // dated after latestBucketRecieved
    const feedItems = await getFeedItemsFilteredByDestination({destination, req, updatedAt: { $gte: latestBucketRecieved }, limit});
    const bucket = await createBucket({feedItems, req, destination});
    return bucket;
}

async function generateNextFeedBuckets({oldestBucketRecieved, req, limit, destination}: IGenerateNextFeedBucketsProps) {
    // dated before oldestBucketRecieved
    const feedItems = await getFeedItemsFilteredByDestination({destination, req, updatedAt: { $lt: oldestBucketRecieved }, limit});
    const bucket = await createBucket({feedItems, req, destination});
    return bucket;
}

export default function getFeedBuckets(props: IGetFeedBucketsProps) {
    if (props.oldestBucketRecieved) {
        return generateNextFeedBuckets((props as IGenerateNextFeedBucketsProps));
    }
    if (props.latestBucketRecieved) {
        return generateFeedUpdateBuckets((props as IGenerateFeedUpdateBucketsProps));
    }
}