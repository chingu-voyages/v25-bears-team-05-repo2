import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createTestUsers } from "../user/user-test-helper/user-test-helper";
import { UserModel } from "../user/user.model";
import { ConnectionRequestModel } from "./connection-request.model";
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

describe("generate connection request tests", () => {
  test("connection requests generated correctly", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    const connectionRequest =
      await ConnectionRequestModel.generateConnectionRequest({
        requestorId: dummyUserDocuments[0].id,
        approverId: dummyUserDocuments[1].id,
        isTeamMate: false,
      });
    const requestorUserDocument = await UserModel.findById(
      dummyUserDocuments[0].id,
    );

    expect(connectionRequest.document.requestorId).toBe(
      dummyUserDocuments[0].id,
    );
    expect(connectionRequest.document.approverId).toBe(
      dummyUserDocuments[1].id,
    );
    expect(
      requestorUserDocument["connectionRequests"][dummyUserDocuments[1].id],
    ).toBe(connectionRequest.document.id);
  });
});

describe("delete connection request tests", () => {
  test("deletes all requests", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    await ConnectionRequestModel.generateConnectionRequest({
      requestorId: dummyUserDocuments[0].id,
      approverId: dummyUserDocuments[1].id,
      isTeamMate: false,
    });
    await ConnectionRequestModel.generateConnectionRequest({
      requestorId: dummyUserDocuments[0].id,
      approverId: dummyUserDocuments[1].id,
      isTeamMate: false,
    });
    await ConnectionRequestModel.generateConnectionRequest({
      requestorId: dummyUserDocuments[0].id,
      approverId: dummyUserDocuments[1].id,
      isTeamMate: false,
    });

    const userDocument = await ConnectionRequestModel.deleteConnectionRequest({
      requestorId: dummyUserDocuments[0].id,
      approverId: dummyUserDocuments[1].id,
    });

    const requestKeys = Object.keys(userDocument.connectionRequests);
    expect(requestKeys.includes(dummyUserDocuments[1].id)).toBe(false);

    const matchingRequests = await ConnectionRequestModel.find({
      "$and": [
        { "requestorId": dummyUserDocuments[0].id },
        { "approverId": dummyUserDocuments[1].id },
      ],
    });

    expect(matchingRequests.length).toBe(0);
  });
});
