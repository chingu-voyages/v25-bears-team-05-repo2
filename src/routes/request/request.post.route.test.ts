
/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";
import { ConnectionRequestModel } from "../../models/connection-request/connection-request.model";


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

test("POST /request/connection - id missing: expect validation error", async (done) => {
  const res = await request.post("/request/connection/ /");
  expect(res.statusCode).toBe(400);
  done();
});

test(`POST /request/connection/:id 
- invalid requestor id, expect 500 response`, async (done)=> {
  const testUsers = await createTestUsersInDB(2);
  const dummyId = mongoose.Types.ObjectId();
  const res = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: dummyId, isTeamMate: true });
  expect(res.statusCode).toBe(500);
  done();
});
test(`POST /request/connection/:id 
  - creates a request. Expect 200 response`, async (done) => {
  const testUsers = await createTestUsersInDB(5);
  const res = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  const body = res.body as Array<{ [keyof: string]: string}>;
  console.log(res.body);
  expect(res.statusCode).toBe(200);
  expect(Object.keys(body[1])[0]).toBe(testUsers[1].id);
  done();
});

test(`/POST /request/connection/:id
- Check for error message that request already exists`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });

  // Send the same request again - we should get a 400 error
  const res = await request.post(`/request/connection/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id, isTeamMate: true });
  expect(res.statusCode).toBe(400);
  done();
});
