import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";

import { ThreadVisibility } from "../../models/thread/thread.types";
import { queryPublicThreadComments } from "./search.thread-comments";

let mongoServer: any;

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

describe("search thread-comments tests", () => {
  test("Public thread comments: finds search results", async() => {
    // Create some dummy users and threads
    const testUser = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "the source of a ipsum lorem",
    });
    await dummyUserDocuments[0].createAndPostThread({
      html: "random private thread",
      visibility: ThreadVisibility.Connections
    });

    await dummyUserDocuments[1].addThreadComment({
     threadCommentData: { content: "random text field" },
     targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "second comment text" },
      targetThreadId: thread1.threadData.id,
    });

    const result = await queryPublicThreadComments({
        queryString: "Random",
    });
    expect(result.length).toBe(1);
  });
});
