import { createTestUsers } from "../user-test-helper/user-test-helper";
import { UserModel } from "../user.model";
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

describe("user add connection tests", () => {
  test("connections added correctly", async() => {
    // Setup - load a bunch of dummy users into the db
    const testUsers = createTestUsers({ numberOfUsers: 90});
    const dummyUserDocuments = await UserModel.create(testUsers);

    // Complete the action of adding a connection
    const targetUserId = dummyUserDocuments[2].id;
    const target = await dummyUserDocuments[0].addConnectionToUser(targetUserId, true);

    expect(dummyUserDocuments[0].connections).toHaveProperty(targetUserId);
    expect(target.connectionOf).toHaveProperty(dummyUserDocuments[0].id);
  });

  test("multiple connections save correctly", async() => {
    const testUsers = createTestUsers({ numberOfUsers: 11});
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
    const testUsers = createTestUsers({ numberOfUsers: 15});
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

test("gets UseDocuments from users connectionOf object", async () => {
  const testUsers = createTestUsers({ numberOfUsers: 5});
  const dummyUserDocuments = await UserModel.create(testUsers);

  // Users 1, 2, 3 add user 0 as a connection.
  await dummyUserDocuments[1].addConnectionToUser(dummyUserDocuments[0].id.toString());
  await dummyUserDocuments[2].addConnectionToUser(dummyUserDocuments[0].id.toString());
  await dummyUserDocuments[3].addConnectionToUser(dummyUserDocuments[0].id.toString());

  const refreshedUser = await UserModel.findById(dummyUserDocuments[0].id.toString());
  const connectionsOfUserDocuments = await refreshedUser.getUserDocumentsFromSourceUserConnectionOf();

  expect(connectionsOfUserDocuments.length).toBe(3);
  const arrayOfConnectionsOfUserIds = connectionsOfUserDocuments.map(document => document.id.toString());
  expect(arrayOfConnectionsOfUserIds.includes(dummyUserDocuments[1].id.toString()));
});
