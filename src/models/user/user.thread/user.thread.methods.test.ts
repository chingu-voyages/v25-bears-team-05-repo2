import { createTestUsers } from "../user-test-helper/user-test-helper";
import { UserModel } from "../user.model";
import { ThreadModel } from "../../thread/thread.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ThreadType } from "../../../models/thread/thread.types";
let mongoServer: any;

const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

beforeEach(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, options, (err) => {
    if (err) console.error(err);
  });
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User creating thread tests", () => {
  test("User creates thread. Thread is saved in threads collection and document is saved in user document", async() => {
    const testUser = createTestUsers(1, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const results = await dummyUserDocuments[0].createAndPostThread({
      html: "test-html",
    });

    const newThread = await ThreadModel.findOne({ postedByUserId: dummyUserDocuments[0].id });
    expect(newThread.postedByUserId.toString()).toEqual(dummyUserDocuments[0].id.toString());
    expect(newThread.content.html).toBe("test-html");
    expect(dummyUserDocuments[0].threads.started[newThread.id.toString()]).toBeDefined();
    expect(dummyUserDocuments[0].threads.started[newThread.id.toString()].content.html).toBe("test-html");
    expect(results.userData).toBeDefined();
    expect(results.threadData).toBeDefined();

  });

  test("multiple threads save correctly in user document", async() => {
    const testUser = createTestUsers(1, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });
    const thread2 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-2-test",
    });
    const thread3 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-3-test",
    });
    const thread4 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-4-test",
    });

    expect(dummyUserDocuments[0].threads.started).toHaveProperty(thread1.threadData.id);
    expect(dummyUserDocuments[0].threads.started).toHaveProperty(thread2.threadData.id);
    expect(dummyUserDocuments[0].threads.started).toHaveProperty(thread3.threadData.id);
    expect(dummyUserDocuments[0].threads.started).toHaveProperty(thread4.threadData.id);

    expect(dummyUserDocuments[0].threads.started[`${thread1.threadData.id}`].content.html).toBe("thread-1-test");
    expect(dummyUserDocuments[0].threads.started[`${thread4.threadData.id}`].content.html).toBe("thread-4-test");
    expect(Object.keys(dummyUserDocuments[0].threads.started)).toHaveLength(4);
  });
});

describe("thread like tests", () => {
  test("thread like stores correctly on appropriate documents", async() => {
    const testUser = createTestUsers(2, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });
    // Have the second user like the thread
    const result = await dummyUserDocuments[1].addLikeToThread({ targetThreadId: thread1.threadData.id.toString(),
      title: "thumbs-up!"});

    const { updatedThread, threadLikeDocument } = result;
    expect(threadLikeDocument.postedByUserId.toString())
    .toBe(dummyUserDocuments[1].id.toString());
    expect(updatedThread.likes).toHaveProperty(threadLikeDocument.id.toString());
    expect(updatedThread.likes[`${threadLikeDocument.id.toString()}`].title).toBe("thumbs-up!");
    expect(dummyUserDocuments[1].threads.liked).toHaveProperty(updatedThread.id.toString());
    expect(dummyUserDocuments[1].threads.liked[`${updatedThread.id.toString()}`].id.toString())
    .toBe(threadLikeDocument.id.toString());
  });

  test("thread like is deleted", async() => {
    // Setup
    const testUser = createTestUsers(2, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });
    // Have the second user add a threadLike
    const updatedThread = await dummyUserDocuments[1].addLikeToThread({ targetThreadId: thread1.threadData.id.toString(),
      title: "makes-me-think"});

    // Have the second user delete the thread
    const result = await dummyUserDocuments[1].deleteLikeFromThread({ targetThreadId: updatedThread.updatedThread.id.toString(),
      targetLikeId: updatedThread.threadLikeDocument.id.toString() });

    expect(result.updatedThread.likes[`${updatedThread.threadLikeDocument.id.toString()}`]).not.toBeDefined();
    expect(dummyUserDocuments[1].threads.liked).not.toHaveProperty(`${updatedThread.updatedThread.id}`);
  });
});

describe("create and delete threadComment tests", () => {
  test("creates thread comment properly", async() => {
    const testUser = createTestUsers(2, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });

    await dummyUserDocuments[1].addThreadComment({
     threadCommentData: { content: "This the first comment content" },
     targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "This the second comment content" },
      targetThreadId: thread1.threadData.id,
     });
    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "This the third comment content" },
      targetThreadId: thread1.threadData.id,
     });

     const arrayOfKeys = (Object.keys(dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`]));
     expect(Object.keys(dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`])).toHaveLength(3);
     expect(dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`][`${arrayOfKeys[2]}`].content).toBe("This the third comment content");
     expect(dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`][`${arrayOfKeys[2]}`].postedByUserId).toBe(dummyUserDocuments[1].id.toString());
    });

    test("deletes a thread comment properly", async() => {
      const testUser = createTestUsers(2, undefined, undefined);
      const dummyUserDocuments = await UserModel.create(testUser);
      const thread1 = await dummyUserDocuments[0].createAndPostThread({
        html: "thread-1-test",
      });

      await dummyUserDocuments[1].addThreadComment({
        threadCommentData: { content: "This the first comment content" },
        targetThreadId: thread1.threadData.id,
      });
      await dummyUserDocuments[1].addThreadComment({
        threadCommentData: { content: "This the second comment content" },
        targetThreadId: thread1.threadData.id,
      });
      await dummyUserDocuments[1].addThreadComment({
        threadCommentData: { content: "This the third comment content" },
        targetThreadId: thread1.threadData.id,
      });
      const arrayOfKeys = (Object.keys(dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`]));
      const threadCommentId = dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`][`${arrayOfKeys[0]}`]["_id"];
      await dummyUserDocuments[1].deleteThreadComment({ targetThreadId: thread1.threadData.id, targetThreadCommentId: threadCommentId});
      expect(thread1.threadData.comments[`${threadCommentId}`]).not.toBeDefined();
      expect(dummyUserDocuments[1].threads.commented[`${thread1.threadData.id}`][`${threadCommentId}`]).not.toBeDefined();
    });
});


describe("Thread share tests", () => {
  test("threads shared correctly", async() => {
    // Source user posts a thread. User 2 shares it on its own profile. Expect documents to update
    // correctly
    const testUser = createTestUsers(2, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });

    const result = await dummyUserDocuments[1].shareThread({ targetThreadId: thread1.threadData.id.toString(),
    sourceUserId: dummyUserDocuments[0].id.toString(), threadShareType: ThreadType.Post });

    expect(result.updatedThreadDocument.shares[dummyUserDocuments[1].id.toString()]).toBeDefined();
    expect(result.updatedThreadDocument.shares[dummyUserDocuments[1].id.toString()].content.html).toBe("thread-1-test");
    expect(result.updatedSharedThreads[thread1.threadData.id.toString()]).toBeDefined();
  });
  test("threadshares deleted property", async() => {

    const testUser = createTestUsers(2, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });

    await dummyUserDocuments[1].shareThread({ targetThreadId: thread1.threadData.id.toString(),
    sourceUserId: dummyUserDocuments[0].id.toString(), threadShareType: ThreadType.Post });

    const result = await dummyUserDocuments[1].deleteThreadShare({ targetThreadShareId: thread1.threadData.id.toString()});
      expect(result.updatedSharedThreads[thread1.threadData.id]).not.toBeDefined();
      expect(result.updatedThreadDocument.shares[dummyUserDocuments[1].id.toString()]).not.toBeDefined();
  });
});
