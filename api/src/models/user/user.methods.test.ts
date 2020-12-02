import { decrypt, encrypt } from "../../utils/crypto";
import { createTestUsers } from "./user-test-helper/user-test-helper";
import { UserModel } from "./user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ThreadModel } from "../thread/thread.model";
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
    const dummyUserDocuments = await UserModel.create(testUsers);

    // Complete the action of adding a connection
    const targetUserId = dummyUserDocuments[2].id;
    const target = await dummyUserDocuments[0].addConnectionToUser(targetUserId, true);

    expect(dummyUserDocuments[0].connections).toHaveProperty(targetUserId);
    expect(target.connectionOf).toHaveProperty(dummyUserDocuments[0].id);
  });

  test("multiple connections save correctly", async() => {
    const testUsers = createTestUsers(11, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUsers);

    // create a bunch of connections for the first user and save them
    const target1 = await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[10].id);
    const target2 = await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[9].id);
    const target3 = await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[8].id);
    const target4 = await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[7].id);

    expect(dummyUserDocuments[0].connections).toHaveProperty(dummyUserDocuments[7].id);
    expect(dummyUserDocuments[0].connections).toHaveProperty(dummyUserDocuments[8].id);
    expect(dummyUserDocuments[0].connections).toHaveProperty(dummyUserDocuments[9].id);
    expect(dummyUserDocuments[0].connections).toHaveProperty(dummyUserDocuments[10].id);
    expect(dummyUserDocuments[0].connections[dummyUserDocuments[7].id].firstName).toBeDefined();
    expect(dummyUserDocuments[0].connections[dummyUserDocuments[8].id].lastName).toBeDefined();

    expect(target1.connectionOf).toHaveProperty(dummyUserDocuments[0].id);
    expect(target2.connectionOf).toHaveProperty(dummyUserDocuments[0].id);
    expect(target3.connectionOf).toHaveProperty(dummyUserDocuments[0].id);
    expect(target4.connectionOf).toHaveProperty(dummyUserDocuments[0].id);
  });
});

describe("delete user connection tests", () => {
  test("deletes successfully and target's connectionOf object is updated properly", async() => {
    // prepare by adding a bunch of users
    const testUsers = createTestUsers(15, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUsers);

    // create a bunch of connections for the first
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[10].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[9].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[8].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[7].id);

    const target1 = await dummyUserDocuments[0].deleteConnectionFromUser(dummyUserDocuments[7].id);
    const target2 = await dummyUserDocuments[0].deleteConnectionFromUser(dummyUserDocuments[8].id);
    expect(target1.id).toBe(dummyUserDocuments[7].id);
    expect(dummyUserDocuments[0].connections).not.toHaveProperty(target1.id);
    expect(dummyUserDocuments[0].connections).not.toHaveProperty(target2.id);

    expect(target1.connectionOf).not.toHaveProperty(dummyUserDocuments[0].id);
    expect(target2.connectionOf).not.toHaveProperty(dummyUserDocuments[0].id);
  });
});

describe("Profile update tests", () => {
  test("profile update requests single field updates correctly", async() => {
    const testUser = createTestUsers(1, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    await dummyUserDocuments[0].updateUserProfile({
      firstName: "updatedFirstName",
    });

    // Expect only the requested field to save. Other fields should remain intact
    expect(dummyUserDocuments[0].firstName).toBe("updatedFirstName");
    expect(dummyUserDocuments[0].lastName).toBe("testUser0LastName");
    expect(dummyUserDocuments[0].jobTitle).toBe("testUser0JobTitle");
  });

  test("profile update requests all provided fields update correctly", async() => {
    const testUser = createTestUsers(1, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    await dummyUserDocuments[0].updateUserProfile({
      firstName: "uFirstName",
      jobTitle: "designer",
      lastName: "newLastName",
      avatarUrl: "http://avatarurl.com"
    });

    // Expect only the requested field to save. Other fields should remain intact
    expect(dummyUserDocuments[0].firstName).toBe("uFirstName");
    expect(dummyUserDocuments[0].lastName).toBe("newLastName");
    expect(dummyUserDocuments[0].jobTitle).toBe("designer");
    expect(dummyUserDocuments[0].avatar[0].url).toBe("http://avatarurl.com");
  });

  test("avatar url - ensures only adds unique url", async() => {
    const testUser = createTestUsers(1, undefined, undefined);
    const dummyUserDocuments = await UserModel.create(testUser);
    // Push some test avatar urls
    dummyUserDocuments[0].avatar.push({ url: "http://fake1.com"},
    { url: "http://fake2.com"},
    { url: "http://fake3.com"});
    await dummyUserDocuments[0].save();

    expect(dummyUserDocuments[0].avatar).toHaveLength(4);

    await dummyUserDocuments[0].updateUserProfile({
      avatarUrl: "http://fake2.com"
    });
    expect(dummyUserDocuments[0].avatar).toHaveLength(4);

    await dummyUserDocuments[0].updateUserProfile({
      avatarUrl: "http://new-fake-url"
    });

    expect(dummyUserDocuments[0].avatar).toHaveLength(5);
    expect(dummyUserDocuments[0].avatar[0].url).toBe("http://new-fake-url");
  });
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
