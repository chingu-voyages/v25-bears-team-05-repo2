/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";

import { getErrorText } from "../utils";
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


test(`PUT /users/:id/connections
 - connection request approvals
 - expect 400 error when id is me`, async (done) => {
  const res = await request.put(`/users/me/connections`);
  expect(res.statusCode).toBe(400);
  done();
});

test(`PUT /users/:id/connections - trigger a validation error`, async (done)=> {
  const res = await request.put(`/users/ /connections`);
  expect(res.statusCode).toBe(400);
  done();
});

test(`PUT /users/:id/connections
- supply fake/invalid connectionRequestDocumentId in body
- expect a 500 error`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create a connection request
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id });

  const fakeDocumentId = mongoose.Types.ObjectId();
  const res = await request.put(`/users/${testUsers[0].id}/connections`)
    .send({ testRequestorId: testUsers[1].id,
      connectionRequestDocumentId: fakeDocumentId });
  expect(getErrorText(res.error)).toBe("request not found or no longer exists");
  expect(res.statusCode).toBe(400);
  done();
});

test(`PUT /users/:id/connections
- approverID doesn't match req user id,
expect 400 error`,
async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create a connection request
  const connectionResponse = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id });

  const [, connectionObject] = connectionResponse.body;
  const [, connectionRequestDocumentId] =
    Object.entries(connectionObject)[0];
  const fakeRequestorId = mongoose.Types.ObjectId();
  const res = await request.put(`/users/${testUsers[0].id}/connections`)
    .send({ testRequestorId: fakeRequestorId,
      connectionRequestDocumentId: connectionRequestDocumentId });
  expect(res.statusCode).toBe(400);
  expect(getErrorText(res.error)).toBe("approverId doesn't match req.user.id");
  done();
});

test(`PUT /users/:id/connections
  - connectionRequestDocument's requestorId does not match req.params.id
  - expect 400 response`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create a connection request
  const connectionResponse = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id });

  const [, connectionObject] = connectionResponse.body;
  const [, connectionRequestDocumentId] =
    Object.entries(connectionObject)[0];
  const fakeParamId = mongoose.Types.ObjectId();

  const res = await request.put(`/users/${fakeParamId}/connections`)
    .send({ testRequestorId: testUsers[1].id,
      connectionRequestDocumentId: connectionRequestDocumentId });

  expect(getErrorText(res.error))
    .toBe("connectionRequestDocument's requestorId does not match req.params.id");
  expect(res.statusCode).toBe(400);
  done();
});

test(`PUT /users/:id/connections
 - expect 200 response`, async (done) => {
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);

  // Create a connection request
  const connectionResponse = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id });

  const [, connectionObject] = connectionResponse.body;
  const [, connectionRequestDocumentId] =
    Object.entries(connectionObject)[0];

  const res = await request.put(`/users/${testUsers[0].id}/connections`)
    .send({ testRequestorId: testUsers[1].id,
      connectionRequestDocumentId: connectionRequestDocumentId });
  expect(res.statusCode).toBe(200);
  done();
});
