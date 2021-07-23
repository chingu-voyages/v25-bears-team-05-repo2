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

test("GET /threads/:id - expect thread and response 200", async (done) => {
  const testUser = await createTestUsersInDB(1);
  const thread = await testUser[0].createAndPostThread({
    html: "get into the groove",
    visibility: ThreadVisibility.Anyone,
  });

  const res = await request.get(`/threads/${thread.threadData.id}`).send({
    testRequestorId: testUser[0].id,
  });
  expect(res.statusCode).toBe(200);
  expect(res.body._id).toBe(thread.threadData.id);
  done();
});

test(`GET /threads/:id, 
returns a 404 error if thread is not found`, async (done) => {
  const testUser = await createTestUsersInDB(1);
  const dummyThreadId = mongoose.Types.ObjectId();
  const res = await request.get(`/threads/${dummyThreadId}`).send({
    testRequestorId: testUser[0].id,
  });
  expect(res.statusCode).toBe(404);
  expect(getErrorText(res.error)).toBe(`Unable to find thread with id ${dummyThreadId}`);
  done();
});

test(`GET /threads/:id, 
returns a 500 error due to invalid ObjectId`, async (done) => {
  const testUser = await createTestUsersInDB(1);
  const dummyThreadId = "dummytId";
  const res = await request.get(`/threads/${dummyThreadId}`).send({
    testRequestorId: testUser[0].id,
  });
  expect(res.statusCode).toBe(500);
  done();
});
