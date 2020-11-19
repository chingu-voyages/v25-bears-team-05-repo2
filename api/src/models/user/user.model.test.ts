import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import { UserModel } from "./user.model";
import { createTestUsers } from "./user-test-helper/user-test-helper";
import { IUserModel } from "./user.types";

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

describe("CRUD operations for User model", () => {
  test("successfully saves and retrieves user to mongo database", async () => {
    const testUserData = {
      firstName: "testFirstName",
      lastName: "testLastName",
      auth: {
        email: "test@test.com",
      },
      avatar: [ {url: "testUrl01"} ],
      connections: {},
      connectionOf: {},
      threads: {
        started: {},
        commented: {},
        liked: {},
        shared: {},
      }
    };
    const result = await UserModel.create(testUserData);
    expect(result.auth.email).toBe("test@test.com");
    expect(result.lastName).toBe("testLastName");
    expect(result.avatar[0].url).toBe("testUrl01");
  });

  test("findOrCreate function returns user if found", async () => {
    const [user1, user2] = createTestUsers(2, ["123456789", "987654321", "55544323"]);
    // Put the test models in the collection.
    await UserModel.create([user1, user2]);
    const result = await UserModel.findOneOrCreateByGoogleAuth(user1);
    expect(result.auth.googleId).toBe("123456789");
  });

  test("creates user in db if not found", async () => {
    const [user1, user2] = createTestUsers(2, ["123456789", "987654321"]);
    // Put the test document in the collection.
    await UserModel.create(user1);
    const result = await UserModel.findOneOrCreateByGoogleAuth(user2);
    expect(result.auth.googleId).toBe("987654321");
  });

  test("find user by googleId method retrieves a user", async() => {
    // Create test users and put them in db
    const [user1, user2] = createTestUsers(2, ["123456789", "987654321"]);
    await UserModel.create([user1, user2]);

    // Test the find by google id function
    const result = await UserModel.findByGoogleId("123456789");
    expect(result).toBeDefined();
    expect(result.auth.googleId).toBe("123456789");
    expect(result.auth.googleId).not.toBe("1234567891");
  });
});


