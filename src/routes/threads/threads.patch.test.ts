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

test(`PATCH /threads/:id 
- should patch thread successfully
- should return 200 response`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const thread = await testUsers[0].createAndPostThread({
    html: "M for andromeda",
    threadType: ThreadType.Post,
    visibility: ThreadVisibility.Anyone,
  });
  const { id } = thread.threadData;

  const patchData = {
    htmlContent: "blessed are the poor",
  };
  const res = await request.patch(`/threads/${id}`)
    .send({ ...patchData, testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(200);
  done();
});

test(`PATCH /threads/:id 
- should trigger validation errors
- should return 400 response`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const thread = await testUsers[0].createAndPostThread({
    html: "M for andromeda",
    threadType: ThreadType.Post,
    visibility: ThreadVisibility.Anyone,
  });
  const { id } = thread.threadData;

  const patchData = {
    htmlContent: " ",
    hashTags: "some_",
    threadType: "bebe",
    attachments: "some_",
    visibility: 8.5,
  };

  const res = await request.patch(`/threads/${id}`)
    .send({ ...patchData, testRequestorId: testUsers[0].id });
  const errors = getErrorText(res.error) as ErrorObjectCollection;
  expect(errors.errors.length).toBe(3);
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /threads/:id 
- fake threadId
- should return 500 response`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const thread = await testUsers[0].createAndPostThread({
    html: "billions of things",
    threadType: ThreadType.Post,
    visibility: ThreadVisibility.Anyone,
  });
  const { id } = thread.threadData;

  const patchData = {
    htmlContent: "Steve Burton",
  };
  const fakeThreadId = mongoose.Types.ObjectId();
  const res = await request.patch(`/threads/${id}`)
    .send({ ...patchData, testRequestorId: fakeThreadId });
  expect(getErrorText(res.error)).toBe("Unable to patch thread");
  expect(res.statusCode).toBe(500);
  done();
});
