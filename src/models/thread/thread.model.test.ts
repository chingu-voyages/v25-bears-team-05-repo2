import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;

import { IThread, IThreadPatchData, ThreadType, ThreadVisibility } from "./thread.types";
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
      reactions: { },
      forks: { },
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
      const results = await ThreadModel.getAllPublicThreads([dummyUserDocuments[0].id]);

      expect(results).toHaveLength(3);
      expect(results.filter((result) => {
        return result.postedByUserId === dummyUserDocuments[0].id;
      })).toHaveLength(0);
    });
  });
  describe("thread patch tests", () => {
    test("updates (patching) to thread performs correctly", async() => {
      const testUsers = createTestUsers(2, undefined, undefined);
      const dummyUserDocuments = await UserModel.create(testUsers);
      const dummyThread1 = createDummyPublicThreads(2, dummyUserDocuments[0].id);
      const createdThreads = await ThreadModel.create(dummyThread1);

      expect(createdThreads[0].visibility).toBe(ThreadVisibility.Anyone);

      const patchData: IThreadPatchData = {
        threadId: createdThreads[0].id,
        userId: dummyUserDocuments[0].id,
        htmlContent: "some kind of new content here",
        visibility: ThreadVisibility.Connections,
        threadType: ThreadType.Photo,
        attachments: ["https://some-photo.com/photo1"],
        hashTags: ["#tag1", "#tag2", "#tag2"]
      };
      const patchedThread = await ThreadModel.patchThread(patchData);
      expect(patchedThread.content.html).toBe("some kind of new content here");
      expect(patchedThread.content.hashTags).toHaveLength(2);
      expect(patchedThread.content.hashTags[1]).toBe("#tag2");
      expect(patchedThread.visibility).toBe(ThreadVisibility.Connections);
      expect(patchedThread.content.attachments[0]).toBe("https://some-photo.com/photo1");
      expect(patchedThread.threadType).toBe(ThreadType.Photo);
    });
  });
  test("patch thread function throws when user tries to patch a thread that they didn't author"
  , async() => {
    const testUsers = createTestUsers(2, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUsers);
    const dummyThreadForUser2 = createDummyPublicThreads(2, dummyUserDocuments[1].id);
    const createdThreads = await ThreadModel.create(dummyThreadForUser2);

    const patchData: IThreadPatchData = {
      threadId: createdThreads[0].id,
      userId: dummyUserDocuments[0].id,
    };
    await expect(() => ThreadModel.patchThread(patchData)).rejects.toThrow("Unauthorized patch request");
  });
});
