import { decrypt, encrypt } from "../../utils/crypto";
import { createTestUsers } from "./user-test-helper/user-test-helper";
import { UserModel } from "./user.model";
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

describe("find by encrypted email function tests", () => {
  test("Function works", async() => {
    const dummyUsers = createTestUsers(150, undefined, undefined);
    const encryptedEmail = dummyUsers[0].auth.email; // This should be encrypted
    await UserModel.create(dummyUsers);
    const result = await UserModel.findByEncryptedEmail(encryptedEmail);

    expect(result.length).not.toBe(0);
    expect(decrypt(result[0].auth.email)).toBe("testUser0@test.com");
  });
});

describe("findOneByEncryptedEmail function tests", () => {
  test("function returns a single object", async() => {
    const dummyUsers = createTestUsers(10, undefined, undefined);
    const encryptedEmail = dummyUsers[1].auth.email; // This should be encrypted
    await UserModel.create(dummyUsers);
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);

    expect(result).not.toHaveProperty("length");
    expect(result).toBeDefined();
    expect(decrypt(result.auth.email)).toBe("testUser1@test.com");
  });

  test("function returns undefined because no e-mail exists", async () => {
    const dummyUsers = createTestUsers(5, undefined, undefined);
    const encryptedEmail = encrypt("someOtherEmail@test.com");
    await UserModel.create(dummyUsers);
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);

    expect(result).toBeUndefined();
  });
});

describe("user add connection tests", () => {
  test("connections added correctly", async() => {
    // Setup - load a bunch of dummy users into the db
    const testUsers = createTestUsers(90, undefined, undefined);
    const dummyUserModels = await UserModel.create(testUsers);

    // User #1 will be the originator/requester, and user #2 will be target/receiver
    const targetUserId1 = dummyUserModels[2].id;
    const firstResult = await dummyUserModels[0].addConnectionToUser(targetUserId1, true);

    // Refresh from the database to test that values are saved properly
    const checkResults = await UserModel.findById(firstResult[0].id);
    const checkResults2 = await UserModel.findById(targetUserId1);

    expect(checkResults.connections).toHaveProperty(targetUserId1);
    expect(checkResults2.connectionOf).toHaveProperty(dummyUserModels[0].id);
  });

  test("multiple connections save correctly", async() => {
    const testUsers = createTestUsers(10, undefined, undefined);
    const dummyUserModels = await UserModel.create(testUsers);

    // create a bunch of connections for the first user and save them
    await Promise.all(dummyUserModels.map((dummyUserModel) => {
      return dummyUserModels[0].addConnectionToUser(dummyUserModel.id);
    }));

    // Retrieve the saved originator. Its connections property should
    // be populated by the ids of our dummy models
    const checkResults = await UserModel.findById(dummyUserModels[0].id);
    dummyUserModels.forEach((model) => {
      expect(checkResults.connections).toHaveProperty(model.id);
      expect(checkResults.connections[model.id].firstName).toBeDefined();
    });

    const originalId = dummyUserModels[0].id; // Grab the originator's id
    // Check that each recipient has the originator in their connectionOf object
    const [_, ...filteredModels] = dummyUserModels;

    // Get a list of refreshed recipient from the database
    const recipientModels = await Promise.all(filteredModels.map((filteredModel) => {
      return UserModel.findById(filteredModel.id);
    }));

    recipientModels.forEach((model) => {
      expect(model.connectionOf).toHaveProperty(originalId);
    });
  });
});
