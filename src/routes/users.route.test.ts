/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../server";
import { createTestUsers } from "../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../models/user/user.model";
import { IUserConnection } from "../models/user-connection/user-connection.types";
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

test("returns user in response body with response 200", async (done)=> {
  // Create some test users
  const dummyUsers = createTestUsers({ numberOfUsers: 1 });
  const userDocuments = await UserModel.create(dummyUsers);
  const res = await request.get(`/users/${userDocuments[0].id}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.firstName).toBe("testUser0FirstName");
  done();
});

test("returns an error 404 if user not found", async (done)=> {
  const invalidId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${invalidId}`);
  expect(res.statusCode).toBe(404);
  done();
});

test("returns 500 after some server error", async (done) => {
  const res = await request.get(`/users/12345467`);
  expect(res.statusCode).toBe(500);
  done();
});


test("GET /users/:id/connections - returns connections", async (done)=> {
  // Setup
  const dummyUsers = createTestUsers({ numberOfUsers: 5 });
  const userDocuments = await UserModel.create(dummyUsers);
  await userDocuments[0].addConnectionToUser(userDocuments[1].id, true);
  await userDocuments[0].addConnectionToUser(userDocuments[2].id, false);
  const res = await request.get(`/users/${userDocuments[0].id}/connections`);
  expect(res.statusCode).toBe(200);
  const retrievedConnections = Object.values(res.body) as IUserConnection[];
  expect(retrievedConnections[0].userId).toBe(userDocuments[1].id);
  expect(retrievedConnections[1].userId).toBe(userDocuments[2].id);
  done();
});

test(`GET /users/me/connections 
- using 'me' as id, expect a 404 error since 
req.user isn't defined in test environment`, async (done)=> {
  const res = await request.get("/users/me/connections");
  expect(res.statusCode).toBe(404);
  done();
});

test(`GET /users/:id/connections test for 404 - 
valid format of Id, but not found`, async (done)=> {
  const fakeId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${fakeId}/connections`);
  expect(res.statusCode).toBe(404);
  done();
});
test(`GET /users/:id/connections test for 500 - invalid monogoose id`, async (done)=> {
  const fakeId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${fakeId}1/connections`);
  expect(res.statusCode).toBe(500);
  done();
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

test(`PUT /users/:id/connections`, async (done)=> {
  // const res = await request.put(`/users/ /connections`);
  // console.log(res.error);
  // expect(res.statusCode).toBe(400);
  const dummyUsers = createTestUsers({ numberOfUsers: 2 });
  const testUsers = await UserModel.create(dummyUsers);
  const targetUserDocument = await testUsers[0].addConnectionToUser(testUsers[1].id);
  console.log(targetUserDocument);
  done();
});
