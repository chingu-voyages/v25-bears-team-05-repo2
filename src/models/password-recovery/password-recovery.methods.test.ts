import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createDummyRecoveryRequestDocuments } from "./test-helpers/create-dummy-requests";
import { PasswordRecoveryModel } from "./password-recovery.model";
import { createRequest } from "./password-recovery.methods";
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

describe("password recovery method tests", () => {
  test("find all requests by email - returns all requests with matching e-mail", async () => {
    const requests = createDummyRecoveryRequestDocuments({
      totalNumberRequests: 6,
      withEmail: "myemail@example.com",
      matchingNumber: 5,
    });
    await PasswordRecoveryModel.create(requests);
    const fetchedRequests = await PasswordRecoveryModel.findAllRequestsByEmailId(
      "myemail@example.com"
    );
    expect(fetchedRequests.length).toBe(5);
    expect(
      fetchedRequests.every(
        (request) => request.forAccountEmail === "myemail@example.com"
      )
    ).toBe(true);
  });
  test("no requests found. Expect empty array", async () => {
    const requests = createDummyRecoveryRequestDocuments({
      totalNumberRequests: 6,
      withEmail: "myemail@example.com",
      matchingNumber: 5,
    });
    await PasswordRecoveryModel.create(requests);
    const fetchedRequests = await PasswordRecoveryModel.findAllRequestsByEmailId(
      "some_other_email@example.com"
    );
    expect(fetchedRequests.length).toBe(0);
  });
  test("create method creates request properly", async () => {
    await createRequest({
      emailId: "some_email@example.com",
      requestorIpAddress: "192.168.0.1",
    });
    const result = await PasswordRecoveryModel.find({
      "forAccountEmail": "some_email@example.com",
    });
    expect(result[0].requestorIpAddress).toBe("192.168.0.1");
  });
});
