/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";

import { getErrorText } from "../utils";

import { ThreadVisibility } from "../../models/thread/thread.types";
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

test(`DELETE /threads/:id/likes
- should delete successfully
- expect 200 Response `, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const thread = await testUsers[0].createAndPostThread({
    html: "Some thread",
    visibility: ThreadVisibility.Anyone,
  });
  const threadLike = await testUsers[1].addLikeToThread({
    targetThreadId: thread.threadData.id,
    title: "thumbs_up",
  });

  const res = await request.delete(`/threads/${thread.threadData.id}/likes`)
    .send({ testRequestorId: testUsers[1].id,
      threadLikeId: threadLike.threadLikeDocument.id });
  expect(res.statusCode).toBe(200);
  done();
});

test(`DELETE /threads/:id/likes
- validation: threadId is missing from param
- expect 400 Response `, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const thread = await testUsers[0].createAndPostThread({
    html: "Some thread",
    visibility: ThreadVisibility.Anyone,
  });
  const threadLike = await testUsers[1].addLikeToThread({
    targetThreadId: thread.threadData.id,
    title: "thumbs_up",
  });

  const res = await request.delete(`/threads/ /likes`)
    .send({ testRequestorId: testUsers[1].id,
      threadLikeId: threadLike.threadLikeDocument.id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /threads/:id/likes
- validation: threadLikeId is missing from body
- expect 400 Response `, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const thread = await testUsers[0].createAndPostThread({
    html: "Some thread",
    visibility: ThreadVisibility.Anyone,
  });
  await testUsers[1].addLikeToThread({
    targetThreadId: thread.threadData.id,
    title: "thumbs_up",
  });

  const res = await request.delete(`/threads/${thread.threadData.id}/likes`)
    .send({ testRequestorId: testUsers[1].id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /threads/:id/likes
- validation: id is non-existent in db
- expect 500 Response `, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const thread = await testUsers[0].createAndPostThread({
    html: "Some thread",
    visibility: ThreadVisibility.Anyone,
  });
  const threadLike = await testUsers[1].addLikeToThread({
    targetThreadId: thread.threadData.id,
    title: "thumbs_up",
  });
  const fakeIdParam = mongoose.Types.ObjectId();
  const res = await request.delete(`/threads/${fakeIdParam}/likes`)
    .send({ testRequestorId: testUsers[1].id,
      threadLikeId: threadLike.threadLikeDocument.id });
  expect(res.statusCode).toBe(500);
  done();
});

test(`DELETE /threads/:id/likes
- validation: threadLikeId is non-existent in db
- expect 500 Response `, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const thread = await testUsers[0].createAndPostThread({
    html: "Some thread",
    visibility: ThreadVisibility.Anyone,
  });
  await testUsers[1].addLikeToThread({
    targetThreadId: thread.threadData.id,
    title: "thumbs_up",
  });
  const fakeThreadLikeId = mongoose.Types.ObjectId();
  const res = await request.delete(`/threads/${thread.threadData.id}/likes`)
    .send({ testRequestorId: testUsers[1].id,
      threadLikeId: fakeThreadLikeId });
  expect(res.statusCode).toBe(500);
  done();
});
