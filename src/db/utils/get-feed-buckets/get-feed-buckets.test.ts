import { createTestUsers } from "../../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../../models/user/user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { FeedItemModel } from "../../../models/feed-item/feed-item.model";
import { IUserDocument } from "../../../models/user/user.types";
import { IFeedItemDocument } from "../../../models/feed-item/feed-item.types";
let mongoServer: any;

const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

let dummyUsers: IUserDocument[];
let dummyFeedItems: IFeedItemDocument[];

beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        await mongoose.connect(mongoUri, options, (err) => {
        if (err) console.error(err);
    });

    const usersTestData = createTestUsers({numberOfUsers: 2});
    dummyUsers = await Promise.all(usersTestData.map(data => UserModel.create(data)));

    const threadId = mongoose.Types.ObjectId();
    const storyLine = [
        {
            byUserId: dummyUsers[0].id,
            action: "joined",
            documentType: "user",
            documentId: dummyUsers[0].id,
        },
        {
            byUserId: dummyUsers[1].id,
            action: "joined",
            documentType: "user",
            documentId: dummyUsers[1].id,
        },
        {
            byUserId: dummyUsers[0].id,
            action: "posted",
            documentType: "thread",
            documentId: threadId,
        },
        {
            byUserId: dummyUsers[1].id,
            action: "commented",
            documentType: "comment",
            documentId: mongoose.Types.ObjectId(),
        },
        {
            byUserId: dummyUsers[0].id,
            action: "updated",
            documentType: "thread",
            documentId: threadId,
            propertiesChanged: {
                content: {
                    html: ""
                }
            }
        },
        {
            byUserId: dummyUsers[1].id,
            action: "updated their comment",
            documentType: "comment",
            documentId: mongoose.Types.ObjectId(),
        },
        {
            byUserId: dummyUsers[1].id,
            action: "reacted to",
            documentType: "reaction",
            documentId: mongoose.Types.ObjectId(),
        },
    ];
    const getFeedItemDataBase = ({offsetUpdatedAt}: {offsetUpdatedAt?: number}) => ({
        documentId: mongoose.Types.ObjectId(),
        documentType: "thread",
        documentUpdatedAt: new Date(offsetUpdatedAt || 0),
        action: "posted",
        byUserId: dummyUsers[0].id,
        propertiesChanged: {}
    });
    dummyFeedItems = await Promise.all(storyLine.map((data, i) => FeedItemModel.create({...getFeedItemDataBase({offsetUpdatedAt: i*1000}), ...data})));

});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Buckets", async () => {
    it("Returns with correct structure", async () => {
        
    });
    it("Has bucket items with correct structure", async () => {

    });
    it("Gives bucket items a priority relative to current user", async () => {
    
    })
    describe("getFeedBucket with prop {latestBucketRecieved: 0}", () => {
        it("Returns the lastest set of buckets", async () => {
    
        });
    });
    describe("getFeedBucket with prop {latestBucketRecieved: <date from a few buckets in>}", () => {
        it("Returns the lastest set of buckets after latestBucketRecieved date", async () => {
    
        });
    });
    describe("getFeedBucket with prop {oldestBucketRecieved: <date from a few buckets in>}", () => {
        it("Returns the lastest set of buckets", async () => {
    
        });
    });
    describe("getFeedBucket with prop {oldestBucketRecieved: <date of oldest bucket>}", () => {
        it("Returns bucket with empty collection object (as there are no more buckets)", async () => {
    
        });
    });
});
