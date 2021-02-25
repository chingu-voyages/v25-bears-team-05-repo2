import { createTestUsers } from "../../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../../models/user/user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { FeedItemModel } from "../../../models/feed-item/feed-item.model";
import { IUserDocument } from "../../../models/user/user.types";
import { IFeedItem, IFeedItemDocument } from "../../../models/feed-item/feed-item.types";
import getFeedBuckets from "./get-feed-buckets";
import { IThreadDocument } from "../../../models/thread/thread.types";
import { createDummyPublicThreads } from "../../../models/thread/thread-test-helper/thread-test-helper";
import { ThreadModel } from "../../../models/thread/thread.model";
let mongoServer: any;

const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

let [primaryUser, connectionUser, connectionOfConnectionUser, secondaryUser]: Array<IUserDocument | undefined> = [];
let primaryUserThreads: IThreadDocument[] = [];
let secondaryUserThreads: IThreadDocument[] = [];
let connectionUserThreads: IThreadDocument[] = [];
let dummyFeedItems: IFeedItemDocument[];

beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        await mongoose.connect(mongoUri, options, (err) => {
        if (err) console.error(err);
    });

    // create 3 test users, primary current user, connection of primary, secondary current user not a connection
    const usersTestData = createTestUsers({numberOfUsers: 4});
    [primaryUser, connectionUser, connectionOfConnectionUser, secondaryUser] = await Promise.all(usersTestData.map(data => UserModel.create(data)));
    const primaryUserThreadsData = createDummyPublicThreads(1, primaryUser.id);
    const secondaryUserThreadsData = createDummyPublicThreads(1, secondaryUser.id);
    const connectionUserThreadsData = createDummyPublicThreads(1, connectionUser.id);
    
    let currentDate = Date.now();
    const NextDate = () => {
        const nextDate = new Date(currentDate + 60*1000);
        currentDate = nextDate.getTime();
        return nextDate;
    };

    let feedItemsTestData: Array<IFeedItem> = [
        // primaryUser and connectionUser join
        {
            byUserId: primaryUser.id,
            action: "joined",
            documentType: "user",
            documentId: primaryUser.id,
            documentUpdatedAt: NextDate(),
        },
        {
            byUserId: connectionUser.id,
            action: "joined",
            documentType: "user",
            documentId: connectionUser.id,
            documentUpdatedAt: NextDate(),
        },
        // connectionOfConnectionUser and secondaryUser join
        {
            byUserId: connectionOfConnectionUser.id,
            action: "joined",
            documentType: "user",
            documentId: connectionOfConnectionUser.id,
            documentUpdatedAt: NextDate(),
        },
        {
            byUserId: secondaryUser.id,
            action: "joined",
            documentType: "user",
            documentId: secondaryUser.id,
            documentUpdatedAt: NextDate(),
        },
    ];

    // primaryUser and connectionUser add each other as connections
    primaryUser.addConnectionToUser(connectionUser.id);
    connectionUser.addConnectionToUser(primaryUser.id);
    feedItemsTestData = [...feedItemsTestData,   
        {
            byUserId: primaryUser.id,
            action: "connected with",
            documentType: "connection",
            documentId: connectionUser.id,
            documentUpdatedAt: NextDate(),
        },
        {
            byUserId: connectionUser.id,
            action: "connected with",
            documentType: "connection",
            documentId: primaryUser.id,
            documentUpdatedAt: NextDate(),
        },
    ];

    // connectionUser and connectionOfConnectionUser add each other as connections
    connectionUser.addConnectionToUser(connectionOfConnectionUser.id);
    connectionOfConnectionUser.addConnectionToUser(connectionUser.id);
    feedItemsTestData = [...feedItemsTestData,   
        {
            byUserId: connectionUser.id,
            action: "connected with",
            documentType: "connection",
            documentId: connectionOfConnectionUser.id,
            documentUpdatedAt: NextDate(),
        },
        {
            byUserId: connectionOfConnectionUser.id,
            action: "connected with",
            documentType: "connection",
            documentId: connectionUser.id,
            documentUpdatedAt: NextDate(),
        },
    ];

    // primaryUser posts thread
    primaryUserThreads = await Promise.all([...primaryUserThreads, ThreadModel.create(primaryUserThreadsData[0])]);
    feedItemsTestData = [...feedItemsTestData,    
        {
            byUserId: primaryUser.id,
            action: "posted",
            documentType: "thread",
            documentId: primaryUserThreads[0].id,
            documentUpdatedAt: NextDate(),
        },
    ];

    // connectionUser comments on thread
    const connectionUsersComment = (await connectionUser.addThreadComment({
        targetThreadId: primaryUserThreads[0].id,
        threadCommentData: {content: "test comment"}
    })).newComment;
    feedItemsTestData = [...feedItemsTestData,   
        {
            byUserId: connectionUser.id,
            action: "commented",
            documentType: "comment",
            documentId: connectionUsersComment.id,
            documentUpdatedAt: NextDate(),
        },
    ];
        
    // connectionUser updates comment
    
    feedItemsTestData = [...feedItemsTestData,   
        {
            byUserId: connectionUser.id,
            action: "updated their comment",
            documentType: "comment",
            documentId: connectionUsersComment.id,
            documentUpdatedAt: NextDate(),
            propertiesChanged: {
                content: ""
            }
        },
    ];

    // connectionUser reacts to thread
    const connectionUsersReaction = (await connectionUser.addReactionToThread({
        targetThreadId: primaryUserThreads[0].id,
        title: "star"
    })).threadReactionDocument;
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: connectionUser.id,
            action: "reacted to",
            documentType: "reaction",
            documentId: connectionUsersReaction.id,
            documentUpdatedAt: NextDate(),
        },
    ];
        
    // secondaryUser comments on thread
    const secondaryUsersComment = (await secondaryUser.addThreadComment({
        targetThreadId: primaryUserThreads[0].id,
        threadCommentData: {content: "test comment"}
    })).newComment;
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: secondaryUser.id,
            action: "commented",
            documentType: "comment",
            documentId: secondaryUsersComment.id,
            documentUpdatedAt: NextDate(),
        },
    ];
        
    // secondaryUser reacts to thread
    const secondaryUsersReaction = (await secondaryUser.addReactionToThread({
        targetThreadId: primaryUserThreads[0].id,
        title: "star"
    })).threadReactionDocument;
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: secondaryUser.id,
            action: "reacted to",
            documentType: "reaction",
            documentId: secondaryUsersReaction.id,
            documentUpdatedAt: NextDate(),
        },
    ];
        
    // primaryUser updates thread
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: primaryUser.id,
            action: "updated",
            documentType: "thread",
            documentId: primaryUserThreads[0].id,
            documentUpdatedAt: NextDate(),
            propertiesChanged: {
                content: {
                    html: ""
                }
            }
        },
    ];
        
    // connectionUser posts thread
    connectionUserThreads = await Promise.all([...connectionUserThreads, ThreadModel.create(connectionUserThreadsData[0])]);
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: connectionUser.id,
            action: "posted",
            documentType: "thread",
            documentId: connectionUserThreads[0].id,
            documentUpdatedAt: NextDate(),
        },
    ];
        
    // connectionUser updates thread
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: connectionUser.id,
            action: "updated",
            documentType: "thread",
            documentId: connectionUserThreads[0].id,
            documentUpdatedAt: NextDate(),
            propertiesChanged: {
                content: {
                    html: ""
                }
            }
        },
    ];
        
    // secondaryUser posts thread
    secondaryUserThreads = await Promise.all([...secondaryUserThreads, ThreadModel.create(secondaryUserThreadsData[0])]);
    feedItemsTestData = [...feedItemsTestData,
        {
            byUserId: secondaryUser.id,
            action: "posted",
            documentType: "thread",
            documentId: secondaryUserThreads[0].id,
            documentUpdatedAt: NextDate(),
        },
    ];
        
    // secondaryUser updates thread
    feedItemsTestData = [...feedItemsTestData,   
        {
            byUserId: secondaryUser.id,
            action: "updated",
            documentType: "thread",
            documentId: secondaryUserThreads[0].id,
            documentUpdatedAt: NextDate(),
            propertiesChanged: {
                content: {
                    html: ""
                }
            }
        },
    ];

    dummyFeedItems = await Promise.all(feedItemsTestData.map(data => FeedItemModel.create(data)));
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
            console.log({bucketArrays0: JSON.stringify(buckets0)})
            const buckets1 = await getFeedBuckets({latestBucketRecieved: "0", req: {user: connectionUser}, destination: "home"});
            console.log({bucketArrays1: JSON.stringify(buckets1)})
            const buckets2 = await getFeedBuckets({latestBucketRecieved: "0", req: {user: secondaryUser}, destination: "home"});
            console.log({bucketArrays2: JSON.stringify(buckets2)})
        })
        describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
            it("Returns the lastest set of buckets", async () => {
                const buckets = await getFeedBuckets({latestBucketRecieved: "0", req: {user: primaryUser}, destination: "home"});
                const bucketArrays = Object.values(buckets?.collection || {});
                const bucketItem = bucketArrays?.[0]?.[0];
            });
            it("Contains bucket items for new threads", async () => {

            });
            it("Contains bucket items for threads updated by connections", async () => {

            });
            it("Contains bucket items for comments by connections", async () => {

            });
            it("Contains bucket items for reactions by connections", async () => {

            });
        });
        describe("getFeedBucket with prop {latestBucketRecieved: <date from a few buckets in>}", () => {
            it("Returns the lastest set of buckets after latestBucketRecieved date", async () => {
        
            });
        });
        describe("getFeedBucket with prop {oldestBucketRecieved: <date from a few buckets in>}", () => {
            it("Returns bucket items older then oldestBucketRecieved", async () => {
        
            });
        });
        describe("getFeedBucket with prop {oldestBucketRecieved: <date of oldest bucket>}", () => {
            it("Returns bucket with empty collection object (as there are no more buckets)", async () => {
        
            });
        });
    });
    describe("Profile feed", () => {
        describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
            it("Contains bucket items for threads and thread updates by current user", async () => {

            });
            it("Contains bucket items for new connections made by current user", async () => {

            });
            it("Contains bucket items for comments and reactions made by current user", async () => {

            });
            it("Contains bucket items for profile updates made by current user", async () => {

            });
        })
    });
    describe("Notifcation feed", () => {
        describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
            it("Contains bucket items for reactions and comments on current users threads", async () => {
                
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
