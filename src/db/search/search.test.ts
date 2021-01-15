import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";
import { ThreadVisibility } from "../../models/thread/thread.types";

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

    // Source user creates some public posts
    const thread1 = await dummySourceUsers[0].createAndPostThread({
      html: "first post lora",
      hashTags: ["hash1", "hash2"],
      visibility: ThreadVisibility.Anyone,
    });
    const thread2 = await dummySourceUsers[0].createAndPostThread({
      html: "second post annum",
      hashTags: ["hash3", "hash4"],
    });
    const thread3 = await dummySourceUsers[0].createAndPostThread({
      html: "third post datum",
      hashTags: ["hash55", "hash66"],
    });
  });
});
