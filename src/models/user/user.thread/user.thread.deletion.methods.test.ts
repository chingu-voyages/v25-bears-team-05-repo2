import { createTestUsers } from "../user-test-helper/user-test-helper";
import { UserModel } from "../user.model";
import { deleteUserCommentsForThreadByThreadId } from "./user.thread.deletion.methods";

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
describe("deleteUserCommentsForThreadByThreadId", () => {
  test.only("returns users that have commented on a thread", async() => {
    const testUser = createTestUsers(6, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "thread-1-test",
    });

    const thread2 = await dummyUserDocuments[0].createAndPostThread({
      html: "This post is an alternate one"
    });

    await dummyUserDocuments[1].addThreadComment({
     threadCommentData: { content: "ichi" },
     targetThreadId: thread1.threadData.id,
    });

    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "another response"},
      targetThreadId: thread2.threadData.id
    });

    await dummyUserDocuments[2].addThreadComment({
      threadCommentData: { content: "ni" },
      targetThreadId: thread1.threadData.id,
     });
    await dummyUserDocuments[3].addThreadComment({
      threadCommentData: { content: "san" },
      targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[4].addThreadComment({
      threadCommentData: { content: "shi" },
      targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[5].addThreadComment({
      threadCommentData: { content: "go" },
      targetThreadId: thread1.threadData.id,
    });

    await deleteUserCommentsForThreadByThreadId({ sourceThreadId: thread1.threadData.id.toString()});
    // Test that it's been delete

    const user5 = await UserModel.findById(dummyUserDocuments[5].id);
    console.log("71", user5.threads.commented);
  });
});
