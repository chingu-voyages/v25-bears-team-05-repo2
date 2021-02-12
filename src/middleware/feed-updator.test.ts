import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import { IThread, IThreadDocument, IThreadPatchData, ThreadType, ThreadVisibility } from "../models/thread/thread.types";
import { ThreadModel }  from "../models/thread/thread.model";
import _ from "lodash";
import { FeedItemModel } from "../models/feed-item/feed-item.model";
import { IFeedItemDocument } from "../models/feed-item/feed-item.types";
import { IUserDocument } from "../models/user/user.types";
import { UserModel } from "../models/user/user.model";
import { encrypt } from "../utils/crypto";
import { IThreadReactionDocument } from "../models/thread-reaction/thread-reaction.types";
import { ThreadReactionModel } from "../models/thread-reaction/thread-reaction.model";
import { IThreadCommentDocument } from "../models/thread-comment/thread-comment.types";
import { ThreadCommentModel } from "../models/thread-comment/thread-comment.model";
import { UserConnectionModel } from "../models/user-connection/user-connection.model";
import { IUserConnection } from "../models/user-connection/user-connection.types";
const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

const testUserData = {
    firstName: "testFirstName",
    lastName: "testLastName",
    auth: {
        email: encrypt("test@test.com"),
    },
    avatarUrls: [ {url: "testUrl01"} ],
    connections: {},
    connectionOf: {},
    threads: {
        started: {},
        commented: {},
        reacted: {},
        forked: {},
    }
};
const testThreadData: IThread = {
    threadType: ThreadType.Article,
    postedByUserId: null, // will be set on Threads section with userDocument
    visibility: ThreadVisibility.Anyone,
    content: {
        html: "someSampleHTML"
    },
    comments: { },
    reactions: { },
    forks: { },
    createdAt: new Date(),
    updatedAt: new Date()
};
const testThreadPatchData: IThreadPatchData = {
    threadId: null, // will be set on "Thread document gets updated" section with threadDocument
    userId: null, // will be set on "Thread document gets updated" section with userDocument
    htmlContent: "some kind of new content here",
    visibility: ThreadVisibility.Connections,
    threadType: ThreadType.Photo
};

let userDocumentPromise: Promise<IUserDocument>;
let threadDocumentPromise: Promise<IThreadDocument>;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, options, (err) => {
    if (err) console.error(err);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Feed updator middleware:", () => {
    describe("Users:", () => {
        test("User document gets created", async () => {
            userDocumentPromise = UserModel.create(testUserData);
            const userDocument = await userDocumentPromise;

            expect(userDocument).toBeInstanceOf(UserModel);
        });
        let feedItemDocumentPromise: Promise<IFeedItemDocument>;
        test("Feed has item for created user", async () => {
            feedItemDocumentPromise = new Promise(async (resolve,reject) => {
                FeedItemModel.findOne({ "documentId": (await userDocumentPromise)._id }).then(item => resolve(item), err => reject(err));
            });
            const feedItemDocument = await feedItemDocumentPromise;
            expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
        });
        test("Feed item has correct values for created thread", async () => {
            const feedItemDocument = await feedItemDocumentPromise;
            const userDocument = await userDocumentPromise;
            const testProperties: Partial<IFeedItemDocument> = {
                action: "joined",
                documentType: "user",
                documentUpdatedAt: userDocument.updatedAt,
                byUserId: userDocument._id 
            };
            expect({
                action: feedItemDocument.action,
                documentType: feedItemDocument.documentType,
                documentUpdatedAt: feedItemDocument.documentUpdatedAt,
                byUserId: feedItemDocument.byUserId
            }).toEqual(testProperties);
        });
    });
    describe("Thread created:", () => {
        let feedItemDocumentPromise: Promise<IFeedItemDocument>;
        test("Thread document gets created", async () => {
            const userDocument = await userDocumentPromise;
            testThreadData.postedByUserId = userDocument._id;
            threadDocumentPromise = ThreadModel.create(testThreadData);
            const threadDocument = await threadDocumentPromise;
            expect(threadDocument).toBeInstanceOf(ThreadModel)
            expect(threadDocument.postedByUserId).toBe(testThreadData.postedByUserId);
        });
        test("Feed has item for created thread", async () => {
            const threadDocument = await threadDocumentPromise;
            feedItemDocumentPromise = new Promise((resolve,reject) => {
                FeedItemModel.findOne({ "documentId": threadDocument._id }).then(item => resolve(item), err => reject(err));
            });
            const feedItemDocument = await feedItemDocumentPromise;
            expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
        });
        test("Feed item has correct values for created thread", async () => {
            const threadDocument = await threadDocumentPromise;
            const feedItemDocument = await feedItemDocumentPromise;
            const testProperties: Partial<IFeedItemDocument> = {
                action: "posted",
                documentType: "thread",
                documentUpdatedAt: threadDocument.updatedAt,
                byUserId: threadDocument.postedByUserId
            };
            expect({
                action: feedItemDocument.action,
                documentType: feedItemDocument.documentType,
                documentUpdatedAt: feedItemDocument.documentUpdatedAt,
                byUserId: feedItemDocument.byUserId
            }).toEqual(testProperties);
        });
    });
    describe("Thread updated:", () => {
        /* 
        Currently any user can update any thread they have access by adding a reaction or comment. And thus a feed item will be added erroneously
        */
        let feedItemDocumentPromise: Promise<IFeedItemDocument>;
        let patchedThreadPromise: Promise<IThreadDocument>;
        test("Thread document gets updated", async () => {
            const userDocument = await userDocumentPromise;
            const threadDocument = await threadDocumentPromise;
            testThreadPatchData.threadId = threadDocument._id;
            testThreadPatchData.userId = userDocument._id.toString();
            patchedThreadPromise = ThreadModel.patchThread(testThreadPatchData);
            const patchedThread = await patchedThreadPromise;
            expect(patchedThread).toBeInstanceOf(ThreadModel);
            expect(patchedThread.content.html).toBe(testThreadPatchData.htmlContent);
        });
        test("Feed has item for updated thread", async () => {
            const threadDocument = await threadDocumentPromise;
            feedItemDocumentPromise = new Promise((resolve,reject) => {
                FeedItemModel.findOne({ "documentId": threadDocument._id, action: { $ne: "posted" } }).then(item => resolve(item), err => reject(err));
            });
            const feedItemDocument = await feedItemDocumentPromise;
            expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
        });
        test("Feed item has correct values for updated thread", async () => {
            const feedItemDocument = await feedItemDocumentPromise;
            const {_id} = await threadDocumentPromise;
            const threadDocument = await ThreadModel.findById(_id);
            const testProperties: Partial<IFeedItemDocument> = {
                action: "updated",
                documentType: "thread",
                documentUpdatedAt: threadDocument.updatedAt,
                byUserId: threadDocument.postedByUserId,
                propertiesChanged: {
                    content: {
                        html: 'some<span class="removed">Sampl</span><span class="added"> kind of n</span>e<span class="removed">HTML</span><span class="added">w content here</span>'
                    }
                }
            };
            expect({
                action: feedItemDocument.action,
                documentType: feedItemDocument.documentType,
                documentUpdatedAt: feedItemDocument.documentUpdatedAt,
                byUserId: feedItemDocument.byUserId,
                propertiesChanged: feedItemDocument.propertiesChanged
            }).toEqual(testProperties);
        });
    });
       
    describe("Comments:", () => {
        let commentDocumentPromise: Promise<IThreadCommentDocument>;
        let feedItemDocumentPromise: Promise<IFeedItemDocument>;
        test("Comment document gets created", async () => {
            const threadDocument = await threadDocumentPromise;
            const userDocument = await userDocumentPromise;
            commentDocumentPromise = new Promise(async (resolve, reject) => {
                try {
                    const commentDocument = await (await userDocument.addThreadComment({
                        threadCommentData: { content: "This the first comment content" },
                        targetThreadId: threadDocument._id.toString(),
                    })).newComment;
                    resolve(commentDocument);
                } catch (err) {
                    reject(err);
                }
                
            });
            const commentDocument = await commentDocumentPromise;
            expect(commentDocument).toBeInstanceOf(ThreadCommentModel);
        });
        test("Feed has item for created comment", async () => {
            const commentDocument = await commentDocumentPromise;
            feedItemDocumentPromise = new Promise((resolve,reject) => {
                FeedItemModel.findOne({ "documentId": commentDocument._id }).then(item => resolve(item), err => reject(err));
            });
            const feedItemDocument = await feedItemDocumentPromise;
            expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
        });
        test("Feed item has correct values for created comment", async () => {
            const commentDocument = await commentDocumentPromise;
            const feedItemDocument = await feedItemDocumentPromise;
            const testProperties: Partial<IFeedItemDocument> = {
                action: "commented",
                documentType: "comment",
                documentUpdatedAt: commentDocument.updatedAt,
                byUserId: commentDocument.postedByUserId
            };
            expect({
                action: feedItemDocument.action,
                documentType: feedItemDocument.documentType,
                documentUpdatedAt: feedItemDocument.documentUpdatedAt,
                byUserId: feedItemDocument.byUserId.toString()
            }).toEqual(testProperties);
        });
    });
    describe("Reactions:", () => {
        let reactionDocumentPromise: Promise<IThreadReactionDocument>;
        let feedItemDocumentPromise: Promise<IFeedItemDocument>;
        test("Reaction document gets created", async () => {
            const threadDocument = await threadDocumentPromise;
            const userDocument = await userDocumentPromise;
            reactionDocumentPromise = new Promise(async (resolve, reject) => {
                try {
                    const reactionDocument = await (await userDocument.addReactionToThread({ targetThreadId: threadDocument._id.toString(), title: "star"})).threadReactionDocument;
                    resolve(reactionDocument);
                } catch (err) {
                    reject(err);
                }
                
            });
            const reactionDocument = await reactionDocumentPromise;
            expect(reactionDocument).toBeInstanceOf(ThreadReactionModel);
        });
        test("Feed has item for created reaction", async () => {
            const reactionDocument = await reactionDocumentPromise;
            feedItemDocumentPromise = new Promise((resolve,reject) => {
                FeedItemModel.findOne({ "documentId": reactionDocument._id }).then(item => resolve(item), err => reject(err));
            });
            const feedItemDocument = await feedItemDocumentPromise;
            expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
        });
        test("Feed item has correct values for created reaction", async () => {
            const reactionDocument = await reactionDocumentPromise;
            const feedItemDocument = await feedItemDocumentPromise;
            const testProperties: Partial<IFeedItemDocument> = {
                action: "reacted to",
                documentType: "reaction",
                documentUpdatedAt: reactionDocument.updatedAt,
                byUserId: reactionDocument.postedByUserId
            };
            expect({
                action: feedItemDocument.action,
                documentType: feedItemDocument.documentType,
                documentUpdatedAt: feedItemDocument.documentUpdatedAt,
                byUserId: feedItemDocument.byUserId.toString()
            }).toEqual(testProperties);
        });
    });
    /* Connections in feed disabled until we reimplement connections */
    // describe("Connections:", () => {
    //     let connectionDocumentPromise: Promise<IUserConnection>;
    //     let feedItemDocumentPromise: Promise<IFeedItemDocument>;
    //     test("Connection document gets created", async () => {
    //         const userDocument = await userDocumentPromise;
    //         const anotherUserDocument = await UserModel.create(testUserData);
    //         expect(anotherUserDocument).toBeInstanceOf(UserModel);
    //         connectionDocumentPromise = new Promise(async (resolve, reject) => {
    //             try {
    //                 await userDocument.addConnectionToUser(anotherUserDocument._id.toString(), true);
    //                 const connectionDocument = await UserConnectionModel.findOne({"userId": anotherUserDocument._id});
    //                 resolve(connectionDocument);
    //             } catch (err) {
    //                 reject(err)
    //             }
    //         }); 
    //         const connectionDocument = await connectionDocumentPromise;
    //         expect(connectionDocument).toBeInstanceOf(UserModel);
    //     });
    //     test("Feed has item for created connection", async () => {
    //         const connectionDocument = await connectionDocumentPromise;
    //         feedItemDocumentPromise = new Promise((resolve,reject) => {
    //             FeedItemModel.findOne({ "documentId": connectionDocument.userId }).then(item => resolve(item), err => reject(err));
    //         });
    //         const feedItemDocument = await feedItemDocumentPromise;
    //         expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
    //     });
    //     test("Feed item has correct values for created connection", async () => {
    //         const connectionDocument = await connectionDocumentPromise;
    //         const userDocument = await userDocumentPromise;
    //         const feedItemDocument = await feedItemDocumentPromise;
    //         const testProperties: Partial<IFeedItemDocument> = {
    //             action: "connected with",
    //             documentType: "connection",
    //             documentUpdatedAt: connectionDocument.dateTimeConnected,
    //             byUserId: userDocument._id
    //         };
    //         expect({
    //             action: feedItemDocument.action,
    //             documentType: feedItemDocument.documentType,
    //             documentUpdatedAt: feedItemDocument.documentUpdatedAt,
    //             byUserId: feedItemDocument.byUserId
    //         }).toEqual(testProperties);
    //     });
    // });
});