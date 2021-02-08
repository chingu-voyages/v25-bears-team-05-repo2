import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";

import { ThreadVisibility } from "../../models/thread/thread.types";
import {
  queryPrivateThreadComments,
  queryPublicThreadComments,
} from "./search.thread-comments";

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
  test("Public thread comments: finds search results", async () => {
    // Create some dummy users and threads
    const testUser = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUser);
    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "the source of a ipsum lorem",
    });
    await dummyUserDocuments[0].createAndPostThread({
      html: "random private thread",
      visibility: ThreadVisibility.Anyone,
    });

    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "first text field ipsum" },
      targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "second ipsum comment text" },
      targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "third text field lorem ipsum" },
      targetThreadId: thread1.threadData.id,
    });
    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "second comment text" },
      targetThreadId: thread1.threadData.id,
    });

    const result = await queryPublicThreadComments({
      queryString: "ipsum",
    });
    expect(result.length).toBe(3);
    expect(result.every((element) => element.parentThreadId)).not.toBe(null);
  });

  test("private threadComments: finds results", async () => {
    // Create some dummy users and threads
    const testUser = createTestUsers({ numberOfUsers: 5 });
    const dummyUserDocuments = await UserModel.create(testUser);

    const thread1 = await dummyUserDocuments[0].createAndPostThread({
      html: "the source of a ipsum lorem",
      visibility: ThreadVisibility.Connections,
    });
    const thread2 = await dummyUserDocuments[0].createAndPostThread({
      html: "random private thread ipsum",
      visibility: ThreadVisibility.Anyone,
    });
    await dummyUserDocuments[0].addConnectionToUser(
      dummyUserDocuments[1]._id.toString()
    );

    await dummyUserDocuments[0].addConnectionToUser(
      dummyUserDocuments[4]._id.toString()
    );

    await dummyUserDocuments[1].addThreadComment({
      threadCommentData: { content: "thread1 response ipsum" },
      targetThreadId: thread1.threadData.id,
    });

    await dummyUserDocuments[2].addThreadComment({
      threadCommentData: { content: "thread2 response ipsum" },
      targetThreadId: thread2.threadData.id,
    });
    await dummyUserDocuments[4].addThreadComment({
      threadCommentData: {
        content: "user 4 response to thread1 response ipsum",
      },
      targetThreadId: thread1.threadData.id,
    });
    const result = await queryPrivateThreadComments({
      requestorUserId: dummyUserDocuments[1].id.toString(),
      queryString: "ipsum",
    });
    expect(result.length).toBe(2);
  });
});
