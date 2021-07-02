/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";

import { ErrorObjectCollection, getErrorText } from "../utils";

import { ThreadType, ThreadVisibility } from "../../models/thread/thread.types";
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

test(`POST /threads
- successfully creates a post
- receives correct response
- expect 200`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const requestBody = {
    threadType: 0,
    visibility: ThreadVisibility.Anyone,
    htmlContent: "this is a new thread",
  };
  const res = await request.post(`/threads`)
    .send({ ...requestBody, testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(200);
  expect(res.body.content.html).toBe("this is a new thread");
  expect(res.body.postedByUserId).toBe(testUsers[0].id);
  done();
});

test(`POST /threads
- validation errors
- expect 400`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const requestBody = {

  };
  const res = await request.post(`/threads`)
    .send({ ...requestBody, testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(400);
  const errors = getErrorText(res.error) as ErrorObjectCollection;
  expect(errors.errors.length).toBe(5);
  done();
});

test(`POST /threads
- using a fakeUser id
- expect 500`, async (done) => {
  await createTestUsersInDB(1);
  const requestBody = {
    threadType: 0,
    visibility: ThreadVisibility.Anyone,
    htmlContent: "lorem ipsum thread",
  };
  const fakeUser = mongoose.Types.ObjectId();
  const res = await request.post(`/threads`)
    .send({ ...requestBody, testRequestorId: fakeUser });
  expect(res.statusCode).toBe(500);
  done();
});

test(`POST /threads/:id/likes,
- creates a thread like
- expect 200 response`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const thread = await testUsers[0].createAndPostThread({
    html: "source thread",
    threadType: ThreadType.Post,
    visibility: ThreadVisibility.Anyone,
  });

  const res = await request.post(`/threads/${thread.threadData.id}/likes`).send({
    testRequestorId: testUsers[1].id, title: "thumbs_up",
  });
  expect(res.body.updatedThread).toBeDefined();
  expect(res.body.threadLikeDocument).toBeDefined();
  expect(res.statusCode).toBe(200);
  done();
});

test(`POST /threads/:id/likes,
- id is missing
- expect 400 response`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const res = await request.post(`/threads/ /likes`).send({
    testRequestorId: testUsers[1].id, title: "thumbs_up",
  });
  expect(res.statusCode).toBe(400);
  done();
});

test(`POST /threads/:id/likes,
- title is missing
- expect 400 response`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const fakeThreadId = mongoose.Types.ObjectId();
  const res = await request.post(`/threads/${fakeThreadId}/likes`).send({
    testRequestorId: testUsers[1].id,
  });
  expect(res.statusCode).toBe(400);
  done();
});

test(`POST /threads/:id/likes,
- id is fake
- expect 500 response`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const fakeThreadId = mongoose.Types.ObjectId();
  const res = await request.post(`/threads/${fakeThreadId}/likes`).send({
    testRequestorId: testUsers[1].id, title: "thumbs_up",
  });
  expect(res.statusCode).toBe(500);
  done();
});
