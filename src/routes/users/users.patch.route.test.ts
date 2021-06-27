/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";

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

test(`PATCH /users/:id
- id is something other than me or reqUserId expect 400`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.patch(`/users/you`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /users/you
- id is some other valid id, but not reqUserId or me
- expect 400`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const fakeID = mongoose.Types.ObjectId();
  const res = await request.patch(`/users/${fakeID}`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /users/:id
- id is empty
- expect 400`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.patch(`/users/ /`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /users/you
- req.body.avatar is an invalid URL
- expect 400`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.patch(`/users/${testUsers[0].id}`)
    .send({ testRequestorId: testUsers[0].id, avatar: "c: windows" });
  console.log((res.error));
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /users/you
- req.body.avatar is an valid URL
- expect 200`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.patch(`/users/${testUsers[0].id}`)
    .send({ testRequestorId: testUsers[0].id,
      avatar: "http://my.resource.com/family.jpg" });
  expect(res.statusCode).toBe(200);
  done();
});

test(`PATCH /users/you
- updates data correctly
- expect 200`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.patch(`/users/${testUsers[0].id}`)
    .send({ testRequestorId: testUsers[0].id,
      avatar: "http://my.resource.com/family.jpg  ",
      firstName: "newFirstName",
      lastName: "someOtherNewLastName",
      jobTitle: "aNewTitle",
    });
  expect(res.body).toEqual( {
    firstName: "newFirstName",
    lastName: "someOtherNewLastName",
    jobTitle: "aNewTitle",
    avatar: "http://my.resource.com/family.jpg",
    email: "testUser0@test.com",
  });
  expect(res.statusCode).toBe(200);
  done();
});
