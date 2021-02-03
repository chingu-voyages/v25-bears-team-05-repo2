import { Document, Schema } from "mongoose";
import getObjectDiffs from "../utils/getObjectDiffs";
import { FeedItemModel } from "../models/feed-item/feed-item.model";
import { IFeedItem, TDocumentForTheFeed, TFeedChangeSummeryAction } from "../models/feed-item/feed-item.types";

function findAction({doc, propertiesChanged, documentType}: {doc: TDocumentForTheFeed, propertiesChanged: IFeedItem["propertiesChanged"], documentType: IFeedItem["documentType"]}) {
    let action: TFeedChangeSummeryAction | undefined;
    switch(documentType) {
        case "thread": {
            if (doc.isNew) {
                action = "posted";
            } else if (propertiesChanged.hasOwnProperty("content")) {
                action = "updated";
            }
            break;
        }
        case "comment": {
            if (doc.isNew) {
                action = "commented";
            } else if (propertiesChanged.hasOwnProperty("content")) {
                action = "updated their comment";
            }
            break;
        }
        case "user": {
            break;
        }
        case "connection": {
            if (doc.isNew) {
                action = "connected with";
            }
            break;
        }
        case "reaction": {
            if (doc.isNew) {
                action = "reacted to";
            }
            break;
        }
        default: {
            action = "no action defined";
        }
    }
    return action;
}

async function addToFeed(doc: TDocumentForTheFeed, originalDoc: TDocumentForTheFeed | undefined) {
    const documentType = (doc.collection.collectionName as IFeedItem["documentType"]);
    const propertiesChanged = getObjectDiffs(doc, originalDoc);
    const action = findAction({doc, propertiesChanged, documentType});
    const byUserId = doc.hasOwnProperty("postedByUserId") ? doc.postedByUserId : doc.hasOwnProperty("userId") && doc.userId;
    const feedData = {
        documentType,
        documentUpdateAt: doc.updatedAt,
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
        preDoc = this;
    });
    schema.post('save', async function(doc) {
        if (!doc.hasOwnProperty("updatedAt") || !(doc.hasOwnProperty("postedByUserId") || doc.hasOwnProperty("userId"))) {
            console.warn(`Item not added to feed because ${doc} does not contain properties for updatedAt and postedByUserId or userId`);
        } else {
            await addToFeed((doc as unknown as TDocumentForTheFeed), (preDoc as unknown as TDocumentForTheFeed));
        }
    });
    return schema
}