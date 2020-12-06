import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;

import { IThread, ThreadType, ThreadVisibility } from "./thread.types";
import { ThreadModel }  from "./thread.model";
import { createDummyPublicThreads } from "./thread-test-helper/thread-test-helper";
import { createTestUsers } from "../user/user-test-helper/user-test-helper";
import { UserModel } from "../user/user.model";
import _ from "lodash";
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

describe("CRUD operations for Thread model", () => {
  test("saves and retrieves thread to mongoDB", async () => {
    const sampleId = mongoose.Types.ObjectId();
    const testThreadData: IThread = {
      threadType: ThreadType.Article,
      postedByUserId: sampleId,
      visibility: ThreadVisibility.Anyone,
      content: {
        html: "someSampleHTML",
        hashTags: ["#hashTag1", "#hashTag2"],
        attachments: ["a1490dfw4", "b90d*hd*734"],
      },
      comments: { },
      likes: { },
      shares: { },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await ThreadModel.create(testThreadData);
    expect(result.threadType).toBe(ThreadType.Article);

    expect(result.postedByUserId).toBe(sampleId);
    expect(result.visibility).toBe(ThreadVisibility.Anyone);
    expect(result.content.html).toBe("someSampleHTML");
    expect(result.content.attachments[1]).toBe("b90d*hd*734");
  });
  describe("getAllPublicThread tests", () => {
    test("get all public threads returns public threads", async() => {
      // Create a user
      const testUsers = createTestUsers(10, undefined, undefined);
      const dummyUserDocuments = await UserModel.create(testUsers);

      // Create some threads
      const dummyThreads = dummyUserDocuments.map((dummyUser) => {
        return createDummyPublicThreads(1, dummyUser.id);
      });
      const resultingFlattenedThreads = _.flatten(dummyThreads);
      expect(resultingFlattenedThreads).toHaveLength(10);
    });
    test("get all public threads where the thread creator is excluded", async() => {
      const testUsers = createTestUsers(2, undefined, undefined);
      const dummyUserDocuments = await UserModel.create(testUsers);

      const user1DummyThreads = createDummyPublicThreads(2, dummyUserDocuments[0].id);
      const user2DummyThreads = createDummyPublicThreads(2, dummyUserDocuments[1].id);
      await ThreadModel.create(user1DummyThreads);
      await ThreadModel.create(user2DummyThreads);
      const results = await ThreadModel.getAllPublicThreads(dummyUserDocuments[0].id);

      expect(results).toHaveLength(3);
      expect(results.filter((result) => {
        return result.postedByUserId === dummyUserDocuments[0].id;
      })).toHaveLength(0);
    });
  });
});
