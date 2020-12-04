import { createTestUsers } from "./user-test-helper/user-test-helper";
import { UserModel } from "./user.model";
import { ThreadModel } from "../thread/thread.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
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
