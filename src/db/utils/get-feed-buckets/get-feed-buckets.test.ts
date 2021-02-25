import { createTestUsers } from "../../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../../models/user/user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { IUserDocument } from "../../../models/user/user.types";
import getFeedBuckets from "./get-feed-buckets";
import { ThreadModel } from "../../../models/thread/thread.model";
let mongoServer: any;

const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

let [primaryUser, connectionUser, connectionOfConnectionUser, secondaryUser]: Array<IUserDocument | undefined> = [];

beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        await mongoose.connect(mongoUri, options, (err) => {
        if (err) console.error(err);
    });

    // create 3 test users, primary current user, connection of primary, secondary current user not a connection
    const usersTestData = createTestUsers({numberOfUsers: 4});
    [primaryUser, connectionUser, connectionOfConnectionUser, secondaryUser] = await Promise.all(usersTestData.map(data => UserModel.create(data)));
    
    // primaryUser and connectionUser add each other as connections
    await primaryUser.addConnectionToUser(connectionUser.id);
    await connectionUser.addConnectionToUser(primaryUser.id);

    // connectionUser and connectionOfConnectionUser add each other as connections
    await connectionUser.addConnectionToUser(connectionOfConnectionUser.id);
    await connectionOfConnectionUser.addConnectionToUser(connectionUser.id);

    // primaryUser posts thread
    const primaryUsersThread = (await primaryUser.createAndPostThread({html: "test-html"})).threadData;

    // connectionUser comments on thread
    await connectionUser.addThreadComment({
        targetThreadId: primaryUsersThread.id,
        threadCommentData: {content: "test comment"}
    });
        
    // connectionUser updates comment
    await connectionUser.addThreadComment({
        targetThreadId: primaryUsersThread.id,
        threadCommentData: {content: "test comment"}
    });

    // connectionUser reacts to thread
    await connectionUser.addReactionToThread({
        targetThreadId: primaryUsersThread.id,
        title: "star"
    });
        
    // secondaryUser comments on thread
    await secondaryUser.addThreadComment({
        targetThreadId: primaryUsersThread.id,
        threadCommentData: {content: "test comment"}
    });
        
    // secondaryUser reacts to thread
    await secondaryUser.addReactionToThread({
        targetThreadId: primaryUsersThread.id,
        title: "star"
    });
        
    // primaryUser updates thread
    await ThreadModel.patchThread({
        threadId: primaryUsersThread.id,
        userId: primaryUser.id,
        htmlContent: "test-update-threads-html"
    });
        
    // connectionUser posts thread
    const connectionUsersThread = (await connectionUser.createAndPostThread({html: "test-html"})).threadData;
        
    // connectionUser updates thread
    await ThreadModel.patchThread({
        threadId: connectionUsersThread.id,
        userId: connectionUser.id,
        htmlContent: "test-update-threads-html"
    });
        
    // secondaryUser posts thread
    const secondaryUsersThread = (await secondaryUser.createAndPostThread({html: "test-html"})).threadData;

    // secondaryUser updates thread
    await ThreadModel.patchThread({
        threadId: secondaryUsersThread.id,
        userId: secondaryUser.id,
        htmlContent: "test-update-threads-html"
    });

});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Buckets", () => {
    describe("Home feed", () => {
        it("Returns with correct structure", async () => {
            const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
            expect(buckets).toEqual(expect.objectContaining({
                collection: expect.any(Object),
                latestUpdate: expect.any(Date),
                oldestUpdate: expect.any(Date),
            }));
            const collectionKeys = Object.keys(buckets.collection);
            expect(collectionKeys.some(key => isNaN(parseInt(key)))).toBeFalsy;
        });
        it("Has bucket items with correct structure", async () => {
            const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
            const bucketArrays = Object.values(buckets?.collection || {});
            const bucketItem = bucketArrays?.[0]?.[0];
            expect(bucketItem).toEqual(expect.objectContaining({
                documentId: expect.any(Object),
                documentType: expect.any(String),
                documentUpdatedAt: expect.any(Date),
                action: expect.any(String),
                byUserId: expect.any(Object),
                documentData: expect.any(Object),
                destination: expect.any(String),
            }));
        });
        it("Gives bucket items a priority relative to current user", async () => {
            const buckets0 = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
            const buckets1 = await getFeedBuckets({latestBucketRecieved: "0", req: {user: connectionUser}, destination: "home"});
            const buckets2 = await getFeedBuckets({latestBucketRecieved: "0", req: {user: secondaryUser}, destination: "home"});

            // TODO
        })
        describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
            it("Doesn't contain bucket items made by current user", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const itemsByCurrentUser = bucketItems.filter(item => item.byUserId.toString === primaryUser.id.toString());
                expect(itemsByCurrentUser).toHaveLength(0);
            });
            it("Contains bucket items for new threads", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                expect(bucketItems).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("thread"),
                    action: expect.stringContaining("posted")
                })]));
            });
            it("Contains bucket items for threads updated by connections", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const connections = Object.keys(primaryUser.connections);
                const itemsByConnections = bucketItems.filter(item => connections.includes(item.byUserId.toHexString()));
                console.log({itemsByConnections})
                expect(itemsByConnections).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("thread"),
                    action: expect.stringContaining("updated")
                })]));
            });
            it("Contains bucket items for comments by connections", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const connections = Object.keys(primaryUser.connections);
                const itemsByConnections = bucketItems.filter(item => connections.includes(item.byUserId.toHexString()));
                expect(itemsByConnections).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("comment"),
                    action: expect.stringContaining("commented")
                })]));
            });
            it("Contains bucket items for reactions by connections", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const connections = Object.keys(primaryUser.connections);
                const itemsByConnections = bucketItems.filter(item => connections.includes(item.byUserId.toHexString()));
                expect(itemsByConnections).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("reaction"),
                    action: expect.stringContaining("reacted to")
                })]));
            });
        });
        // TODO
        // describe("getFeedBucket with prop {latestBucketRecieved: <date from a few buckets in>}", () => {
        //     it("Returns the lastest set of buckets after latestBucketRecieved date", async () => {
        
        //     });
        // });
        // describe("getFeedBucket with prop {oldestBucketRecieved: <date from a few buckets in>}", () => {
        //     it("Returns bucket items older then oldestBucketRecieved", async () => {
        
        //     });
        // });
        // describe("getFeedBucket with prop {oldestBucketRecieved: <date of oldest bucket>}", () => {
        //     it("Returns bucket with empty collection object (as there are no more buckets)", async () => {
        
        //     });
        // });
    });
    describe("Profile feed", () => {
        describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
            it("Contains bucket items for threads and thread updates by current user", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "profile"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const itemsByCurrentUser = bucketItems.filter(item => item.byUserId.toString === primaryUser.id.toString());
                expect(itemsByCurrentUser).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("thread"),
                    action: expect.stringMatching(/posted|updated/)
                })]));
            });
            it("Contains bucket items for new connections made by current user", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "profile"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const itemsByCurrentUser = bucketItems.filter(item => item.byUserId.toString === primaryUser.id.toString());
                expect(itemsByCurrentUser).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("connection"),
                    action: expect.stringContaining("connected with")
                })]));
            });
            it("Contains bucket items for comments and reactions made by current user", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "profile"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const itemsByCurrentUser = bucketItems.filter(item => item.byUserId.toString === primaryUser.id.toString());
                expect(itemsByCurrentUser).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringMatching(/comment|reaction/),
                    action: expect.stringMatching(/commented|reacted to/)
                })]));
            });
            it("Contains bucket items for profile updates made by current user", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "profile"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const itemsByCurrentUser = bucketItems.filter(item => item.byUserId.toString === primaryUser.id.toString());
                expect(itemsByCurrentUser).toEqual(expect.arrayContaining([expect.objectContaining({
                    documentType: expect.stringContaining("user"),
                    action: expect.stringContaining("updated")
                })]));
            });
            it("Doesn't contain bucket items made by other users", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                const itemsByOtherUsers = bucketItems.filter(item => item.byUserId.toString !== primaryUser.id.toString());
                expect(itemsByOtherUsers).toHaveLength(0);
            });
        })
    });
    describe("Notifcation feed", () => {
        describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
            it("Contains bucket items for reactions and comments on current users threads", async () => {
                // TODO: maybe need to add optional parentDocument[id+type]... or maybe even a new 'scope' array: [{docType, docId}, ...]
                // const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "notification"});
                // const bucketItems = Object.values(buckets.collection).reduce((items, bucket) => [...items, ...bucket]);
                // const itemsByCurrentUser = bucketItems.filter(item => item.byUserId.toString === primaryUser.id.toString());
                // expect(itemsByCurrentUser).toEqual(expect.arrayContaining(expect.objectContaining({
                //     documentType: expect.stringMatching(/comment|reaction/),
                //     action: expect.stringMatching(/commented|reacted to/)
                // })));
            });
            it("Contains bucket items for connections made by current user", async () => {
           
            });
        });
    });
    describe("Connections feed", () => {
        it("Contains bucket items for connection requests to current user", async () => {

        });
        it("Contains bucket items for connection requests made by current user", async () => {

        });
        it("Contains bucket items for connections made by current users connections", async () => {

        });
    });
});
