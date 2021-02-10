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

describe("Feed updator middleware:", () => {
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
    
    let userDocument: IUserDocument;
    let threadDocument: IThreadDocument;
    
    describe("Users:", () => {
        describe("User document gets created", async () => {
            userDocument = await UserModel.create(testUserData);
            expect(userDocument).toBeInstanceOf(UserModel);
        });
        describe('Adds a feed item for new user', () => {
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
    describe("Threads:", () => {
        testThreadData.postedByUserId = userDocument._id;
        test("Thread document gets created", async () => {
            threadDocument = await ThreadModel.create(testThreadData);
            expect(threadDocument).toBeInstanceOf(ThreadModel)
            expect(threadDocument.postedByUserId).toBe(testThreadData.postedByUserId);
        });
        describe('Adds a feed item for new thread posted', () => {
            let feedItemDocument: IFeedItemDocument;
            test("Feed has item for created thread", async () => {
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
        describe('Adds a feed item for thread update', () => {
            /* 
            Currently any user can update any thread they have access by adding a reaction or comment. And thus a feed item will be added erroneously
            */
            const testThreadPatchData: IThreadPatchData = {
                threadId: threadDocument._id,
                userId: userDocument._id.toString(),
                htmlContent: "some kind of new content here",
                visibility: ThreadVisibility.Connections,
                threadType: ThreadType.Photo
            };
            let feedItemDocument: IFeedItemDocument;
            let patchedThread: IThreadDocument;
            test("Thread document gets updated", async () => {
                patchedThread = await ThreadModel.patchThread(testThreadPatchData);
                expect(patchedThread).toBeInstanceOf(ThreadModel);
                expect(patchedThread.content.html).toBe(testThreadPatchData.htmlContent);
            });
            test("Feed has item for updated thread", async () => {
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
    describe("Comments:", () => {
        let commentDocument: IThreadCommentDocument;
        test("Comment document gets created", async () => {
            commentDocument = await (await userDocument.addThreadComment({
                threadCommentData: { content: "This the first comment content" },
                targetThreadId: threadDocument._id.toString(),
            })).newComment;
            expect(commentDocument).toBeInstanceOf(ThreadCommentModel);
        });
        let feedItemDocument: IFeedItemDocument;
        describe('Adds a feed item for new comment', () => {
            test("Feed has item for created comment", async () => {
                feedItemDocument = await FeedItemModel.findOne({ "documentId":  });
                expect(feedItemDocument).toBeInstanceOf(FeedItemModel);
            });
            test("Feed item has correct values for created comment", async () => {

            });
        });
        test("Feed has item for updated comment", async () => {

        });
        test("Feed item has correct values for updated comment", async () => {

        });
    });
    describe("Reactions:", () => {
        let reactionDocument: IThreadReactionDocument;
        describe("Reaction document gets created", async () => {
            reactionDocument = await (await userDocument.addReactionToThread({ targetThreadId: threadDocument._id.toString(), title: "star"})).threadReactionDocument;
            expect(reactionDocument).toBeInstanceOf(ThreadReactionModel);
        });
        let feedItemDocument: IFeedItemDocument;
        describe('Adds a feed item for new reaction', () => {
            test("Feed has item for created reactionr", async () => {

            });
            test("Feed item has correct values for created reaction", async () => {

            });
        });
    });
    describe("Connections:", () => {
        let connectionDocument: IUserDocument;
        describe("Connection document gets created", async () => {
            const anotherUserDocument = await UserModel.create(testUserData);
            expect(anotherUserDocument).toBeInstanceOf(UserModel);
            connectionDocument = await userDocument.addConnectionToUser(anotherUserDocument._id.toString(), true);
            expect(connectionDocument).toBeInstanceOf(UserModel);
            expect(connectionDocument.connections).toHaveProperty(anotherUserDocument._id.toString());
        });
        let feedItemDocument: IFeedItemDocument;
        describe('Adds a feed item for new connection', () => {
            test("Feed has item for created connection", async () => {

            });
            test("Feed item has correct values for created connection", async () => {

            });
        });
    });
});
