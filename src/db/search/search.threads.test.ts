import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";

import { ThreadVisibility } from "../../models/thread/thread.types";
import { queryPrivateThreads, queryPublicThreads } from "./search.threads";
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

describe("thread search tests", () => {
  test("gets correct public posts based on query (excludes threadComments)", async() => {
    const testUsers = createTestUsers({ numberOfUsers: 10 });
    const userDocuments = await UserModel.create(testUsers);

    await userDocuments[0].addConnectionToUser(userDocuments[1].id.toString(), true);

    await userDocuments[0].createAndPostThread({ html: "butterflies are free to fly!",
    visibility: ThreadVisibility.Anyone});
    await userDocuments[0].createAndPostThread({ html: "one may fly over the cuckoo's nest",
    visibility: ThreadVisibility.Anyone});
    await userDocuments[1].createAndPostThread({ html: "why do they fly away? disney",
    visibility: ThreadVisibility.Anyone});
    await userDocuments[1].createAndPostThread({ html: "You and I were meant to fly",
    visibility: ThreadVisibility.Connections});


    await userDocuments[0].createAndPostThread({
      html: "What an amazing story about an amazing person. This story talked about all the bad times and all the great accomplishments Walt Disney did in his wonderful life, there is a lot of wonderful information about him as a young person and how he came from nothing to becoming the king of Disneyland."});

    const query1 = await queryPublicThreads({ queryString: "fly" });
    const query2 = await queryPublicThreads({ queryString: "WaLt disnEy!" });
    expect(query1.length).toBe(3);
    expect(query2.length).toBe(2);
  });

  test("gets correct private posts based on a query", async() => {
    const testUsers = createTestUsers({ numberOfUsers: 5 });
    const userDocuments = await UserModel.create(testUsers);

    await userDocuments[4].createAndPostThread({ html: "Nothing is so necessary for a young man",
    visibility: ThreadVisibility.Connections});

    await userDocuments[4].createAndPostThread({ html: "There are more things in heaven and earth, Heratio,",
    visibility: ThreadVisibility.Connections});
    await userDocuments[4].createAndPostThread({ html: "There once was something worthy bah!",
    hashTags: ["apples", "plumbing"],
    visibility: ThreadVisibility.Connections});

    await userDocuments[4].addConnectionToUser(userDocuments[0].id.toString());
    await userDocuments[4].addConnectionToUser(userDocuments[1].id.toString());

    const result1 = await queryPrivateThreads({ requestorUserId: userDocuments[0].id.toString(), queryString: "heratio" });
    const result2 = await queryPrivateThreads({ requestorUserId: userDocuments[4].id.toString(), queryString: "young man"});
    const result3 = await queryPrivateThreads({ requestorUserId: userDocuments[1].id.toString(), queryString: "plumbing" });
    expect(result1.length).toBe(1);
    expect(result1[0].content.html).toBe("There are more things in heaven and earth, Heratio,");
    expect(result2.length).toBe(0);
    expect(result3.length).toBe(1);
  });
});
