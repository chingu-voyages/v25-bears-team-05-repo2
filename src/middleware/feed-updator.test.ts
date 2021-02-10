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
const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

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

describe("Feed updator middleware:", async () => {
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
    
    let userDocument: IUserDocument;
    let threadDocument: IThreadDocument;
    
    await describe("Users:", async () => {
        describe("User document gets created", async () => {
            userDocument = await UserModel.create(testUserData);
            expect(userDocument).toBeInstanceOf(UserModel);
            let feedItemDocument: IFeedItemDocument;
            test("Feed has item for created user", async () => {
                feedItemDocument = await FeedItemModel.findOne({ "documentId": userDocument._id });
                expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
            });
            test("Feed item has correct values for created thread", async () => {
                const testProperties: Partial<IFeedItemDocument> = {
                    action: "joined",
                    documentType: "user",
                    documentUpdateAt: userDocument.updatedAt,
                    byUserId: userDocument._id 
                };
                expect({
                    action: feedItemDocument.action,
                    documentType: feedItemDocument.documentType,
                    documentUpdateAt: feedItemDocument.documentUpdateAt,
                    byUserId: feedItemDocument.byUserId
                }).toEqual(testProperties);
            });
        });
    });
    await describe("Threads:", async () => {
        testThreadData.postedByUserId = userDocument._id;
        await test("Thread document gets created", async () => {
            threadDocument = await ThreadModel.create(testThreadData);
            expect(threadDocument).toBeInstanceOf(ThreadModel)
            expect(threadDocument.postedByUserId).toBe(testThreadData.postedByUserId);
            let feedItemDocument: IFeedItemDocument;
            await test("Feed has item for created thread", async () => {
                feedItemDocument = await FeedItemModel.findOne({ "documentId": threadDocument._id });
                expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
            });
            test("Feed item has correct values for created thread", async () => {
                const testProperties: Partial<IFeedItemDocument> = {
                    action: "posted",
                    documentType: "thread",
                    documentUpdateAt: threadDocument.updatedAt,
                    byUserId: threadDocument.postedByUserId
                };
                expect({
                    action: feedItemDocument.action,
                    documentType: feedItemDocument.documentType,
                    documentUpdateAt: feedItemDocument.documentUpdateAt,
                    byUserId: feedItemDocument.byUserId
                }).toEqual(testProperties);
            });
        });
        /* 
        Currently any user can update any thread they have access by adding a reaction or comment. And thus a feed item will be added erroneously
        */
        test("Thread document gets updated", async () => {
            testThreadPatchData.threadId = threadDocument._id;
            testThreadPatchData.userId = userDocument._id.toString();
            let feedItemDocument: IFeedItemDocument;
            const patchedThread = await ThreadModel.patchThread(testThreadPatchData);
            expect(patchedThread).toBeInstanceOf(ThreadModel);
            expect(patchedThread.content.html).toBe(testThreadPatchData.htmlContent);
            await test("Feed has item for updated thread", async () => {
                feedItemDocument = await FeedItemModel.findOne({ "documentId": threadDocument._id, action: { $ne: "posted" } });
                expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
            });
            test("Feed item has correct values for updated thread", async () => {
                const testProperties: Partial<IFeedItemDocument> = {
                    action: "updated",
                    documentType: "thread",
                    documentUpdateAt: threadDocument.updatedAt,
                    byUserId: threadDocument.postedByUserId,
                    propertiesChanged: {
                        content: {
                            html: {
                                added: [patchedThread.content.html],
                                removed: [testThreadData.content.html]
                            }
                        }
                    }
                };
                expect({
                    action: feedItemDocument.action,
                    documentType: feedItemDocument.documentType,
                    documentUpdateAt: feedItemDocument.documentUpdateAt,
                    byUserId: feedItemDocument.byUserId,
                    propertiesChanged: feedItemDocument.propertiesChanged
                }).toEqual(testProperties);
            });
        });
    });
    describe("Comments:", async () => {
        let commentDocument: IThreadCommentDocument;
        test("Comment document gets created", async () => {
            commentDocument = await (await userDocument.addThreadComment({
                threadCommentData: { content: "This the first comment content" },
                targetThreadId: threadDocument._id.toString(),
            })).newComment;
            expect(commentDocument).toBeInstanceOf(ThreadCommentModel);
            let feedItemDocument: IFeedItemDocument;
            test("Feed has item for created comment", async () => {
                feedItemDocument = await FeedItemModel.findOne({ "documentId": commentDocument._id });
                expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
            });
            test("Feed item has correct values for created comment", async () => {
                const testProperties: Partial<IFeedItemDocument> = {
                    action: "commented",
                    documentType: "comment",
                    documentUpdateAt: commentDocument.updatedAt,
                    byUserId: commentDocument.postedByUserId
                };
                expect({
                    action: feedItemDocument.action,
                    documentType: feedItemDocument.documentType,
                    documentUpdateAt: feedItemDocument.documentUpdateAt,
                    byUserId: feedItemDocument.byUserId
                }).toEqual(testProperties);
            });
        });
    });
    describe("Reactions:", async () => {
        let reactionDocument: IThreadReactionDocument;
        describe("Reaction document gets created", async () => {
            reactionDocument = await (await userDocument.addReactionToThread({ targetThreadId: threadDocument._id.toString(), title: "star"})).threadReactionDocument;
            expect(reactionDocument).toBeInstanceOf(ThreadReactionModel);
            let feedItemDocument: IFeedItemDocument;
            describe('Adds a feed item for new reaction', () => {
                test("Feed has item for created reaction", async () => {
                    feedItemDocument = await FeedItemModel.findOne({ "documentId": reactionDocument._id });
                    expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
                });
                test("Feed item has correct values for created reaction", async () => {
                    const testProperties: Partial<IFeedItemDocument> = {
                        action: "reacted to",
                        documentType: "reaction",
                        documentUpdateAt: reactionDocument.updatedAt,
                        byUserId: reactionDocument.postedByUserId
                    };
                    expect({
                        action: feedItemDocument.action,
                        documentType: feedItemDocument.documentType,
                        documentUpdateAt: feedItemDocument.documentUpdateAt,
                        byUserId: feedItemDocument.byUserId
                    }).toEqual(testProperties);
                });
            });
        });
    });
    describe("Connections:", async () => {
        let connectionDocument: IUserDocument;
        await describe("Connection document gets created", async () => {
            const anotherUserDocument = await UserModel.create(testUserData);
            expect(anotherUserDocument).toBeInstanceOf(UserModel);
            connectionDocument = await userDocument.addConnectionToUser(anotherUserDocument._id.toString(), true);
            expect(connectionDocument).toBeInstanceOf(UserModel);
            expect(connectionDocument.connections).toHaveProperty(anotherUserDocument._id.toString());
            let feedItemDocument: IFeedItemDocument;
            describe('Adds a feed item for new connection', () => {
                test("Feed has item for created connection", async () => {
                    feedItemDocument = await FeedItemModel.findOne({ "documentId": connectionDocument._id });
                    expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
                });
                test("Feed item has correct values for created connection", async () => {
                    const testProperties: Partial<IFeedItemDocument> = {
                        action: "connected with",
                        documentType: "reaction",
                        documentUpdateAt: connectionDocument.updatedAt,
                        byUserId: userDocument._id
                    };
                    expect({
                        action: feedItemDocument.action,
                        documentType: feedItemDocument.documentType,
                        documentUpdateAt: feedItemDocument.documentUpdateAt,
                        byUserId: feedItemDocument.byUserId
                    }).toEqual(testProperties);
                });
            });
        });
    });
});