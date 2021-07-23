import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createTestUsers } from "../user-test-helper/user-test-helper";
import { UserModel } from "../user.model";
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

describe("Profile update tests", () => {
  test("profile update requests single field updates correctly", async () => {
    const testUser = createTestUsers({ numberOfUsers: 1 });
    const dummyUserDocuments = await UserModel.create(testUser);
    await dummyUserDocuments[0].updateUserProfile({
      firstName: "updatedFirstName",
    });

    // Expect only the requested field to save. Other fields should remain intact
    expect(dummyUserDocuments[0].firstName).toBe("updatedFirstName");
    expect(dummyUserDocuments[0].lastName).toBe("testUser0LastName");
    expect(dummyUserDocuments[0].jobTitle).toBe("testUser0JobTitle");
  });

  test("profile update requests all provided fields update correctly", async () => {
    const testUser = createTestUsers({ numberOfUsers: 1 });
    const dummyUserDocuments = await UserModel.create(testUser);
    await dummyUserDocuments[0].updateUserProfile({
      firstName: "uFirstName",
      jobTitle: "designer",
      lastName: "newLastName",
      avatarUrl: "http://avatarurl.com",
    });

    // Expect only the requested field to save. Other fields should remain intact
    expect(dummyUserDocuments[0].firstName).toBe("uFirstName");
    expect(dummyUserDocuments[0].lastName).toBe("newLastName");
    expect(dummyUserDocuments[0].jobTitle).toBe("designer");
    expect(dummyUserDocuments[0].avatar[0].url).toBe("http://avatarurl.com");
  });

  test("avatar url - ensures only adds unique url", async () => {
    const testUser = createTestUsers({ numberOfUsers: 1 });
    const dummyUserDocuments = await UserModel.create(testUser);
    // Push some test avatar urls
    dummyUserDocuments[0].avatar.push({ url: "http://fake1.com" },
      { url: "http://fake2.com" },
      { url: "http://fake3.com" });
    await dummyUserDocuments[0].save();

    expect(dummyUserDocuments[0].avatar).toHaveLength(4);

    await dummyUserDocuments[0].updateUserProfile({
      avatarUrl: "http://fake2.com",
    });
    expect(dummyUserDocuments[0].avatar).toHaveLength(4);

    await dummyUserDocuments[0].updateUserProfile({
      avatarUrl: "http://new-fake-url",
    });

    expect(dummyUserDocuments[0].avatar).toHaveLength(5);
    expect(dummyUserDocuments[0].avatar[0].url).toBe("http://new-fake-url");
  });

  test("getFullName works as expected", async ()=> {
    const testUser = createTestUsers({ numberOfUsers: 2 });
    testUser[0].firstName = "John";
    testUser[0].lastName = "Roberts";
    testUser[1].firstName = "";
    testUser[1].lastName = "Roberts";
    const dummyUserDocuments = await UserModel.create(testUser);

    expect(dummyUserDocuments[0].getFullName()).toBe("John Roberts");
    expect(dummyUserDocuments[1].getFullName()).toBe(" Roberts");
  });
});
