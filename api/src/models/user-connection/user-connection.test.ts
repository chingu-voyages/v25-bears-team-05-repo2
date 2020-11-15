/**
 * Testing user connection object and storage with mongoose
 */

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserConnectionModel } from "./user-connection.model";
import { IUserConnection } from "./user-connection.types";
import { createTestUsers } from "../user/user-test-helper/user-test-helper";
import { UserModel } from "../user/user.model";

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

describe("user connection tests", () => {
  test("user connection is saved to originator's record", async () => {

    // Create two test users, then assign a connection for the first user
    // using second user's data
    const [testUser0, testUser1] = createTestUsers(2);
    const userDocuments = await UserModel.create([testUser0, testUser1]);

    const testConnection: IUserConnection = {
      firstName: testUser1.firstName,
      lastName: testUser1.lastName,
      avatar: testUser1.avatar,
      isTeamMate: false,
    };
    // clone
    const connectionId = userDocuments[1]._id;
    const testUserConnectionDocument = new UserConnectionModel(testConnection);
    userDocuments[0].connections[connectionId] = testUserConnectionDocument;
    const savedDocumentWithNewConnection = await userDocuments[0].save();
    expect(savedDocumentWithNewConnection.connections[connectionId]).toBeDefined;
    console.log(savedDocumentWithNewConnection);
  });
});
