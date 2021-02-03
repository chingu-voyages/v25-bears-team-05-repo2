import * as express from "express";
import { Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { query } from "express-validator/check";
import { FeedItemModel } from "../models/feed-item/feed-item.model";
import { getThreadById } from "../db/utils/get-thread-by-id/get-thread-by-id";
import { getProfileById } from "../db/utils/get-profile-by-id/get-profile-by-id";
import { IBucket, IBucketItem, IFeedItem, IFeedItemDocument, TFeedDocumentType } from "../models/feed-item/feed-item.types";
import { IUserDocument } from "../models/user/user.types";
import { getCommentById } from "../db/utils/get-comment-by-id/get-comment-by-id";
import { IThreadResponse } from "../db/types";
const router = express.Router();

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

async function createBucket({feedItems, reqUserId, reqUserData, destination}: {feedItems: IFeedItemDocument[], reqUserId: string, reqUserData: IUserDocument, destination: IBucketItem["destination"]}) {
  const collection: IBucket["collection"] = {};
  await Promise.all(feedItems.map(async (item) => {
    const {documentType, documentId} = item;
    const documentData: IBucketItem["documentData"] = await getDocumentData({documentType, documentId, reqUserId});
    const priority = calculateBucketPriority({item, reqUserData, documentData});
    const bucketItem = {...item, documentData, destination};
    collection[priority] = [...(collection[priority] || []), bucketItem];
  }));
}

async function generateFeedUpdateBuckets({latestBucketRecieved, req, limit = 20, destination}: {latestBucketRecieved: string, req: any, limit?: number, destination: IBucketItem["destination"]}) {
  const reqUserId = (req.user as IUserDocument)._id;
  // dated after latestBucketRecieved and not by current user
  const feedItems = await FeedItemModel.find({ updatedAt: { $gte: latestBucketRecieved }, postedByUserId: { $ne: reqUserId } }).sort({'updateAt': -1}).limit(limit).exec();
  // transform each item to bucketItem by attaching documentData
  // make collection by sorting into priority groups
  const bucket = await createBucket({feedItems, reqUserId, reqUserData: req.user, destination});
  return bucket;
}

async function generateNextFeedBuckets({oldestBucketRecieved, req, limit = 20, destination}: {oldestBucketRecieved: string, req: any, limit?: number, destination: IBucketItem["destination"]}) {
  const reqUserId = (req.user as IUserDocument)._id;
  // dated before oldestBucketRecieved and not by current user
  const feedItems = await FeedItemModel.find({ updatedAt: { $lt: oldestBucketRecieved }, postedByUserId: { $ne: reqUserId } }).sort({'updateAt': -1}).limit(limit).exec();
  const bucket = await createBucket({feedItems, reqUserId, reqUserData: req.user, destination});
  return bucket;
}

router.get(
  "/", 
  routeProtector, 
  [
    query("desination").not().isEmpty().escape(),
    query("type").not().isEmpty().escape(), 
    query("latestBucketRecieved").escape(),
    query("oldestBucketRecieved").escape()
  ], 
  async (req: express.Request, res: Response) => {
 
  try {
    let buckets;
    const destination = (req.params.desintation as IBucketItem["destination"]);
    if (req.params.type.match("updates")) {
      const latestBucketRecieved = req.params.latestBucketRecieved;
      buckets = await generateFeedUpdateBuckets({latestBucketRecieved, req, destination});
    } else if (req.params.type.match("next")) {
      const oldestBucketRecieved = req.params.oldestBucketRecieved;
      buckets = await generateNextFeedBuckets({oldestBucketRecieved, req, destination});
    }
    res.status(200).send({ buckets });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({
        errors: [
          { ...createError("feed error", `database error. ${err}`, "n/a") },
        ],
      });
  }
});

export default router;
