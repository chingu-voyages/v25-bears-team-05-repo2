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
  test("connections added correctly", async () => {
    // Setup - load a bunch of dummy users into the db
    const testUsers = createTestUsers({ numberOfUsers: 90 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    // Complete the action of adding a connection
    const targetUserId = dummyUserDocuments[2].id;
    const target = await dummyUserDocuments[0].addConnectionToUser(
      targetUserId,
      true,
    );

    expect(dummyUserDocuments[0].connections).toHaveProperty(targetUserId);
    expect(target.connections).toHaveProperty(dummyUserDocuments[0].id);
  });

  test("multiple connections save correctly", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 11 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    // create a bunch of connections for the first user and save them
    const target1 = await dummyUserDocuments[0].addConnectionToUser(
      dummyUserDocuments[10].id,
    );
    const target2 = await dummyUserDocuments[0].addConnectionToUser(
      dummyUserDocuments[9].id,
    );
    const target3 = await dummyUserDocuments[0].addConnectionToUser(
      dummyUserDocuments[8].id,
    );
    const target4 = await dummyUserDocuments[0].addConnectionToUser(
      dummyUserDocuments[7].id,
    );

    expect(dummyUserDocuments[0].connections).toHaveProperty(
      dummyUserDocuments[7].id,
    );
    expect(dummyUserDocuments[0].connections).toHaveProperty(
      dummyUserDocuments[8].id,
    );
    expect(dummyUserDocuments[0].connections).toHaveProperty(
      dummyUserDocuments[9].id,
    );
    expect(dummyUserDocuments[0].connections).toHaveProperty(
      dummyUserDocuments[10].id,
    );
    expect(
      dummyUserDocuments[0].connections[dummyUserDocuments[7].id].firstName,
    ).toBeDefined();
    expect(
      dummyUserDocuments[0].connections[dummyUserDocuments[8].id].lastName,
    ).toBeDefined();

    expect(target1.connections).toHaveProperty(dummyUserDocuments[0].id);
    expect(target2.connections).toHaveProperty(dummyUserDocuments[0].id);
    expect(target3.connections).toHaveProperty(dummyUserDocuments[0].id);
    expect(target4.connections).toHaveProperty(dummyUserDocuments[0].id);
  });

  test("attempt to add user with invalid id, function should throw", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);
    await expect(() =>
      dummyUserDocuments[0].addConnectionToUser("1234567891234567"),
    ).rejects.toThrow();
  });
});

describe("delete user connection tests", () => {
  // eslint-disable-next-line max-len
  test("deletes successfully and target's connections object is updated properly", async () => {
    // prepare by adding a bunch of users
    const testUsers = createTestUsers({ numberOfUsers: 15 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    // create a bunch of connections for the first
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[10].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[9].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[8].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[7].id);

    const target1 = await dummyUserDocuments[0].deleteConnectionFromUser(
      dummyUserDocuments[7].id,
    );
    const target2 = await dummyUserDocuments[0].deleteConnectionFromUser(
      dummyUserDocuments[8].id,
    );
    expect(target1.id).toBe(dummyUserDocuments[7].id);
    expect(dummyUserDocuments[0].connections).not.toHaveProperty(target1.id);
    expect(dummyUserDocuments[0].connections).not.toHaveProperty(target2.id);

    expect(target1.connections).not.toHaveProperty(dummyUserDocuments[0].id);
    expect(target2.connections).not.toHaveProperty(dummyUserDocuments[0].id);
  });

  // eslint-disable-next-line max-len
  test("deleting a connection that doesn't exist in connections object throws", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 15 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    // create a bunch of connections for the first
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[10].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[9].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[8].id);
    await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[7].id);

    await expect(() =>
      dummyUserDocuments[0].deleteConnectionFromUser(dummyUserDocuments[6].id),
    ).rejects.toThrow();
  });
});

test("gets user documents from user's connections object", async () => {
  const testUsers = createTestUsers({ numberOfUsers: 5 });
  const dummyUserDocuments = await UserModel.create(testUsers);

  // Users 1, 2, 3 add user 0 as a connection.
  await dummyUserDocuments[1].addConnectionToUser(
    dummyUserDocuments[0].id.toString(),
  );
  await dummyUserDocuments[2].addConnectionToUser(
    dummyUserDocuments[0].id.toString(),
  );
  await dummyUserDocuments[3].addConnectionToUser(
    dummyUserDocuments[0].id.toString(),
  );

  const refreshedUser = await UserModel.findById(
    dummyUserDocuments[0].id.toString(),
  );
  const connectionsOfUserDocuments =
    await refreshedUser.getUserDocumentsFromConnections();

  expect(connectionsOfUserDocuments.length).toBe(3);
  const arrayOfConnectionsOfUserIds = connectionsOfUserDocuments.map(
    (document) => document.id.toString(),
  );
  expect(
    arrayOfConnectionsOfUserIds.includes(dummyUserDocuments[1].id.toString()),
  );
});
