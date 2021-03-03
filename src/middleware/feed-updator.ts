import { Document, Schema } from "mongoose";
import getObjectDiffs from "../utils/getObjectDiffs";
import { FeedItemModel } from "../models/feed-item/feed-item.model";
import { IFeedItem, TDocumentForTheFeed, TFeedChangeSummeryAction } from "../models/feed-item/feed-item.types";

function findAction({doc, propertiesChanged, documentType}: {doc: TDocumentForTheFeed, propertiesChanged: IFeedItem["propertiesChanged"], documentType: IFeedItem["documentType"]}) {
    let action: TFeedChangeSummeryAction = "no action defined";
    const isNew = doc.createdAt === doc.updatedAt;
    switch(documentType) {
        case "thread": {
            if (isNew) {
                action = "posted";
            } else if (Object.keys(propertiesChanged).includes("content")) {
                action = "updated";
            }
            break;
        }
        case "comment": {
            if (isNew) {
                action = "commented";
            } else if (Object.keys(propertiesChanged).includes("content")) {
                action = "updated their comment";
            }
            break;
        }
        case "user": {
            if (isNew) {
                action = "joined";
            } else if (
                Object.keys(propertiesChanged).includes("firstName") || 
                Object.keys(propertiesChanged).includes("lastName") ||
                Object.keys(propertiesChanged).includes("jobTitle")
            ) {
                action = "updated";
            }
            break;
        }
        case "connection": {
            if (isNew) {
                action = "connected with";
            }
            break;
        }
        case "reaction": {
            if (isNew) {
                action = "reacted to";
            }
            break;
        }
    }
    return action;
}

async function addToFeed(doc: TDocumentForTheFeed, originalDoc: TDocumentForTheFeed | undefined) {
    const documentType = (doc.collection.collectionName as IFeedItem["documentType"]);
    const docObject = doc.toObject(); // So we don't get mongoose InternalCache object properties 
    const propertiesChanged = originalDoc ? getObjectDiffs(docObject, originalDoc, ["content", "html", "firstName", "lastName", "jobTitle"]) : {};
    const action = findAction({doc, propertiesChanged, documentType});
    const byUserId = doc.postedByUserId ? doc.postedByUserId : doc.userId ? doc.userId : doc._id;
    const feedData = {
        documentId: doc._id,
        documentType,
        documentUpdatedAt: doc.dateTimeConnected ? doc.dateTimeConnected : doc.updatedAt,
        action,
        byUserId,
        propertiesChanged
    };
    const newFeedItem = await FeedItemModel.create(feedData);
    return newFeedItem;
}

export default function feedUpdator(schema: Schema) {
    let preDoc: undefined | Document;
    schema.pre('save', async function(this) { 
        preDoc = await this.collection.findOne({"_id": this._id});
    });
    schema.post('save', async function(doc) {
        if ( !(doc as unknown as TDocumentForTheFeed).updatedAt ) {
            console.warn(`Item not added to feed because ${doc} does not contain properties for updatedAt`);
        } else {
            await addToFeed((doc as unknown as TDocumentForTheFeed), (preDoc as unknown as TDocumentForTheFeed));
        }
    });
    return schema
}