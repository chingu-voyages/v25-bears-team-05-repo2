/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../server";
import { createTestUsers } from "../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../models/user/user.model";
import { getErrorText } from "./utils";

// import { createTestUsers } from "../models/user/user-test-helper/user-test-helper";
// import { UserModel } from "../models/user/user.model";
// import { IUserConnection } from "../models/user-connection/user-connection.types";
const request = supertest(httpServer);

const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

beforeAll(async ()=> {
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

test("POST /request/connection - id missing: expect validation error", async (done) => {
  const res = await request.post("/request/connection/ /");
  expect(res.statusCode).toBe(400);
  done();
});

test(`POST /request/connection/:id 
- invalid requestor id, expect 500 response`, async (done)=> {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);
  const dummyId = mongoose.Types.ObjectId();
  const res = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: dummyId, isTeamMate: true });
  expect(res.statusCode).toBe(500);
  done();
});
test(`POST /request/connection/:id 
  - creates a request. Expect 200 response`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  const res = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  const body = res.body as Array<{ [keyof: string]: string}>;

  expect(res.statusCode).toBe(200);
  expect(Object.keys(body[1])[0]).toBe(testUsers[1].id);
  done();
});

test(`/POST /request/connection/:id
- Check for error message that request already exists`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Send the same request again - we should get a 400 error
  const res = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /request/connection/:id 
 req.body.origin and param id are missing, expect 400 error`,
async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  const res = await request.delete(`/request/connection/ /`);
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /request/connection/:id 
 req.body.origin is an invalid value`,
async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  const res = await request.delete(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, origin: "someOtherOrigin" });

  const errorMessage = JSON.parse(res.error.text);
  // eslint-disable-next-line max-len
  expect(errorMessage.error).toBe("The value for req.body.origin is invalid. It should be either 'requestor' or 'approver'");
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /request/connection/:id as requestor
- with a fake id parameter (fake approver)`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Create the delete request as the requestor (a.k.a cancelling the request user made)
  const fakeUserId = mongoose.Types.ObjectId();
  const res = await request.delete(`/request/connection/${fakeUserId}`)
    .send({ testRequestorId: testUsers[0].id, origin: "requestor" });

  expect(getErrorText(res.error)).toBe("Invalid approver");
  expect(res.statusCode).toBe(500);
  done();
});

test(`DELETE /request/connection/:id as requestor
- bad requestor ID
- expect 500 response`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  const fakeUserId = mongoose.Types.ObjectId();
  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  const res = await request.delete(`/request/connection/${testUsers[0].id}`)
    .send({ testRequestorId: fakeUserId, origin: "requestor" });
  expect(getErrorText(res.error)).toBe("Invalid requestor");
  expect(res.statusCode).toBe(500);
  done();
});

test(`DELETE /request/connection/:id as requestor
- expect 200`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Create the delete request as the requestor (a.k.a cancelling the request user made)
  const res = await request.delete(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, origin: "requestor" });
  expect(res.statusCode).toBe(200);
  done();
});

test(`DELETE /request/connection/:id as approver
- expect 200`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Create the delete request as the approver (a.k.a declining the incoming request)
  const res = await request.delete(`/request/connection/${testUsers[0].id}`)
    .send({ testRequestorId: testUsers[1].id, origin: "approver" });
  expect(res.statusCode).toBe(200);
  done();
});
