import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createDummyRecoveryRequestDocuments } from "./test-helpers/create-dummy-requests";
import { PasswordRecoveryModel } from "./password-recovery.model";
import { createRequest } from "./password-recovery.methods";
import { decrypt } from "../../utils/crypto";
import dayjs from "dayjs";

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
        (request) => decrypt(request.forAccountEmail) === "myemail@example.com"
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
    const result = await PasswordRecoveryModel.findAllRequestsByEmailId(
      "some_email@example.com"
    );
    expect(result[0].requestorIpAddress).toBe("192.168.0.1");
  });
});

describe("find request by e-mail and authToken test", () => {
  test("function behaves as expected - locates a result", async () => {
    const dummyRequests = createDummyRecoveryRequestDocuments({
      totalNumberRequests: 2,
      withEmail: "test1@example.com",
      matchingNumber: 1,
    });
    const testAuthToken = dummyRequests[0].authToken;
    await PasswordRecoveryModel.create(dummyRequests);

    const results = await PasswordRecoveryModel.findRequestByEmailAndAuthToken({
      emailId: "test1@example.com",
      authToken: testAuthToken,
    });
    expect(results.authToken).toBe(testAuthToken);
    expect(results).toHaveProperty("forAccountEmail");
  });
  test("function behaves as expected - locates no result", async () => {
    const dummyRequests = createDummyRecoveryRequestDocuments({
      totalNumberRequests: 2,
      withEmail: "test1@example.com",
      matchingNumber: 1,
    });
    const testAuthToken = dummyRequests[0].authToken;
    await PasswordRecoveryModel.create(dummyRequests);

    const result = await PasswordRecoveryModel.findRequestByEmailAndAuthToken({
      emailId: "bn1x@example.com",
      authToken: testAuthToken,
    });
    expect(result).toBeNull();
  });
});
