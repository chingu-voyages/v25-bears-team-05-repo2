import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import { UserModel } from "./user.model";

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
});


