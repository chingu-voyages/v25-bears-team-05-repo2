import { FeedItemModel } from "../../../models/feed-item/feed-item.model";
import { getThreadById } from "../get-thread-by-id/get-thread-by-id";
import { getProfileById } from "../get-profile-by-id/get-profile-by-id";
import { IFeedItem, IFeedItemDocument, TFeedDocumentType } from "../../../models/feed-item/feed-item.types";
import { IUserDocument } from "../../../models/user/user.types";
import { getCommentById } from "../get-comment-by-id/get-comment-by-id";
import { IThreadResponse } from "../../types";
import { IBucket, IBucketItem, IGetFeedBucketsProps, IGetFeedItemsFilteredByDestinationProps } from "./feed-buckets.types";
import { ThreadReactionModel } from "../../../models/thread-reaction/thread-reaction.model";
import { UserConnectionModel } from "../../../models/user-connection/user-connection.model";

function calculateBucketPriority({item, reqUserData, documentData}: {item: IFeedItemDocument, reqUserData: IUserDocument, documentData: IBucketItem["documentData"]}) {
    let priority = 0;
    const isByAConnection = Object.keys(reqUserData.connections).map((userId) => userId).includes(item.byUserId.toString());
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
        case "reaction": {
            documentData = await ThreadReactionModel.findById(documentId);
            break;
        }
        case "connection": {
            documentData = await UserConnectionModel.findById(documentId);
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
                                // threads posted by anyone
                                { action: { $in: ["posted"] } }, 
                                { $and: [ 
                                    // or thread updates
                                    { action: { $in: ["updated"] } }, 
                                    { $or: [
                                        // by connections
                                        { byUserId: { $in: [...Object.keys(reqUserData.connections)] } },
                                        // or a thread current user has interacted with
                                        { documentId: { $in: [...Object.keys(reqUserData.threads.commented), ...Object.keys(reqUserData.threads.reacted) ] } }
                                    ] }
                                ]},
                            ]
                        }
                    ] },
                    { $and: [
                        { documentType: { $in: ["comment"] } }, 
                        { $and: [ 
                            // comments and comment updates 
                            { action: { $in: ["commented", "updated their comment"] } },
                            { $or: [
                                // by a connection
                                { byUserId: { $in: [ ...Object.keys(reqUserData.connections)] } },
                                // or from a thread current user has interacted with
                                { documentId: { $in: [ ...Object.keys(reqUserData.threads.commented), ...Object.keys(reqUserData.threads.reacted) ] } }
                            ] },
                        ] },
                    ]},
                    { $and: [
                        // only connetions made by a connection
                        { documentType: { $in: ["connection"] } }, 
                        { byUserId: { $in: [ ...Object.keys(reqUserData.connections)] } },
                    ]},
                    { $and: [
                        // only reactions made by a connection
                        { documentType: { $in: ["reaction"] } }, 
                        { byUserId: { $in: [ ...Object.keys(reqUserData.connections)] } },
                    ]},
                ]
            }
            break;
        }
        case "profile": {
            preFilter = { byUserId: { $eq: reqUserId } }
            break;
        }
        case "notification": {
            preFilter = { 
                byUserId: { $ne: reqUserId }, 
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

export default async function getFeedBuckets(props: IGetFeedBucketsProps) {
    const {req, limit, destination} = props;
    let dateFilter = {};
    if (props.olderThanDate) {
        dateFilter = {
            $lt: props.olderThanDate
        }
    }
    if (props.newerThanDate) {
        dateFilter = {
            $gte: props.olderThanDate
        }
    }
    const feedItems = await getFeedItemsFilteredByDestination({destination, req, updatedAt: dateFilter, limit});
    const bucket = await createBucket({feedItems, req, destination});
    return bucket;
}