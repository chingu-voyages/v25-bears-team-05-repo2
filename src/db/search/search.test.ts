import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";
import { getUserSearchResults } from "./search";
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

describe("search results tests", () => {
  test("users search results are accurate", async() => {
    // Create a bunch of test users
    const testUsers = createTestUsers({ numberOfUsers: 10, googleIds: undefined, plainTextPasswords: undefined});
    const userDocuments = await UserModel.create(testUsers);

    getUserSearchResults(userDocuments, "");
  });
});
