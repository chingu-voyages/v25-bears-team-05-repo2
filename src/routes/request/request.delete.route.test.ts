/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";
import { getErrorText } from "../utils";
import { ConnectionRequestModel }
  from "../../models/connection-request/connection-request.model";

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
  mongoose.connect(mongoUri, options, (err) => {
    if (err) console.error(err);
  });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


test(`DELETE /request/connection/:id 
 req.body.origin and param id are missing, expect 400 error`,
async (done) => {
  const testUsers = await createTestUsersInDB(2);

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
  const testUsers = await createTestUsersInDB(2);

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
  const testUsers = await createTestUsersInDB(2);

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
  const testUsers = await createTestUsersInDB(2);

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
  const testUsers = await createTestUsersInDB(6);

  await ConnectionRequestModel.generateConnectionRequest({
    requestorId: testUsers[0].id,
    approverId: testUsers[2].id,
    isTeamMate: true,
  });
  await ConnectionRequestModel.generateConnectionRequest({
    requestorId: testUsers[0].id,
    approverId: testUsers[3].id,
    isTeamMate: true,
  });
  await ConnectionRequestModel.generateConnectionRequest({
    requestorId: testUsers[0].id,
    approverId: testUsers[4].id,
    isTeamMate: true,
  });
  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Create the delete request as the requestor (a.k.a cancelling the request user made)
  const res = await request.delete(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, origin: "requestor" });
  expect(Object.values(res.body[1])).toHaveLength(3);
  expect(res.statusCode).toBe(200);
  done();
});

test(`DELETE /request/connection/:id as approver
- expect 200`, async (done) => {
  const testUsers = await createTestUsersInDB(2);

  // Create the request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Create the delete request as the approver (a.k.a declining the incoming request)
  const res = await request.delete(`/request/connection/${testUsers[0].id}`)
    .send({ testRequestorId: testUsers[1].id, origin: "approver" });
  expect(res.statusCode).toBe(200);
  done();
});
