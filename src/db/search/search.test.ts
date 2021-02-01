import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";
import { ThreadVisibility } from "../../models/thread/thread.types";
import { search } from "./search";

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

describe("main search function tests", () => {
  test("make sure the main search function works", async () => {
    // Create a bunch of test data
    const sourceUsers = createTestUsers({ numberOfUsers: 1 });
    const dummySourceUsers = await UserModel.create(sourceUsers);

    // Create secondary users
    const secondaryUsers = createTestUsers({ numberOfUsers: 3 });
    const dummySecondaryUsers = await UserModel.create(secondaryUsers);
    dummySecondaryUsers[0].firstName = "Josie";
    dummySecondaryUsers[0].lastName = "Jacobson";
    // source user adds secondary users as connections
    await dummySourceUsers[0].addConnectionToUser(
      dummySecondaryUsers[0].id.toString()
    );
    await dummySourceUsers[0].addConnectionToUser(
      dummySecondaryUsers[1].id.toString()
    );
    await dummySourceUsers[0].addConnectionToUser(
      dummySecondaryUsers[2].id.toString()
    );

    const otherUser = createTestUsers({ numberOfUsers: 1 });
    const otherDummyUser = await UserModel.create(otherUser);

    // Source user creates some public posts
    const thread1 = await dummySourceUsers[0].createAndPostThread({
      html: "first post lora",
      visibility: ThreadVisibility.Anyone,
    });
    const thread2 = await dummySourceUsers[0].createAndPostThread({
      html: "second post annum",
    });
    const thread3 = await dummySourceUsers[0].createAndPostThread({
      html: "third post datum Jacobson",
      visibility: ThreadVisibility.Connections,
    });

    await dummySecondaryUsers[0].addThreadComment({
      targetThreadId: thread1.threadData.id,
      threadCommentData: { content: "reply from secondary user 0 post" },
    });
    await dummySecondaryUsers[1].addThreadComment({
      targetThreadId: thread2.threadData.id,
      threadCommentData: { content: "reply from secondary user 1 post" },
    });
    await dummySecondaryUsers[2].addThreadComment({
      targetThreadId: thread3.threadData.id,
      threadCommentData: { content: "reply from secondary user 3 post" },
    });

    const query1 = await search({
      queryString: "post Jacobson",
      requestorId: dummySecondaryUsers[0].id,
    });
    const query2 = await search({
      queryString: "secondary nine jacobson",
      requestorId: otherDummyUser[0].id,
    });
    const query3 = await search({
      queryString: "",
      requestorId: otherDummyUser[0].id,
    });

    expect(query1).toHaveProperty("query_string");
    expect(query2).toHaveProperty("users");
    expect(query1).toHaveProperty("public_threads");
    expect(query2).toHaveProperty("private_thread_comments");
    expect(query3.private_thread_comments.length).toBe(0);
  });
});
