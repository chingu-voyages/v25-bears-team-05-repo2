import { UserModel } from "../../../models/user/user.model";
import { createTestUsers } from "../../../models/user/user-test-helper/user-test-helper";
import { getProfileById } from "./get-profile-by-id";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
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

describe("get profile tests", () => {
  test("returns object with the correct properties (no auth)", async () => {
    // Setup test users and enter them into db
    const testUsers = createTestUsers({ numberOfUsers: 5});
    const newUsers = await UserModel.create(testUsers);

    // Grab the id from one of the users so we can test the function
    const id = newUsers[0]._id.toString();
    const result = await getProfileById({userId: id, reqUserId: "na"});

    expect(result.id.toString()).toBe(id);
    expect(result).not.toHaveProperty("auth");
    expect(result).toHaveProperty("firstName");
    expect(result).toHaveProperty("lastName");
    expect(result).toHaveProperty("connections");
    expect(result).toHaveProperty("connectionOf");
    expect(result).toHaveProperty("threads");
    expect(result).toHaveProperty("avatarUrls");
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("jobTitle");
  });
});
