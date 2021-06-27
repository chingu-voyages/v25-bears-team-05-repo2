/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";
import { IUserConnection } from "../../models/user-connection/user-connection.types";
import { ThreadVisibility } from "../../models/thread/thread.types";
import { NotificationModel } from "../../models/notification/notification.model";
import { NotificationType } from "../../models/notification/notification.types";
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
test("GET /users/:id expect 200 response", async (done)=> {
  // Create some test users
  const userDocuments = await createTestUsersInDB(1);
  const res = await request.get(`/users/${userDocuments[0]._id}`)
    .send({ testRequestorId: userDocuments[0]._id });
  expect(res.statusCode).toBe(200);
  expect(res.body.firstName).toBe("testUser0FirstName");
  done();
});

test(`GET /users/:id (ownId) expect 200 response`, async (done) => {
  const userDocuments = await createTestUsersInDB(1);
  const res = await request.get(`/users/${userDocuments[0]._id}`)
    .send({ testRequestorId: userDocuments[0]._id });
  expect(res.statusCode).toBe(200);
  expect(res.body.firstName).toBe("testUser0FirstName");
  done();
});

test(`GET /users/me expect 200 response`, async (done) => {
  const userDocuments = await createTestUsersInDB(1);
  const res = await request.get(`/users/me`)
    .send({ testRequestorId: userDocuments[0]._id });
  expect(res.statusCode).toBe(200);
  expect(res.body.firstName).toBe("testUser0FirstName");
  done();
});

test("GET /users/:id returns an error 404 if user not found", async (done)=> {
  const invalidId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${invalidId}`)
    .send({ testRequestorId: invalidId });
  expect(res.statusCode).toBe(404);
  done();
});

test("GET /users/:id returns 500 after some server error", async (done) => {
  const invalidId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/12345467`)
    .send({ testRequestorId: invalidId });
  expect(res.statusCode).toBe(500);
  done();
});


test("GET /users/:id/connections - returns connections", async (done)=> {
  // Setup
  const userDocuments = await createTestUsersInDB(5);
  await userDocuments[0].addConnectionToUser(userDocuments[1].id, true);
  await userDocuments[0].addConnectionToUser(userDocuments[2].id, false);

  const res = await request.get(`/users/${userDocuments[0].id}/connections`)
    .send({ testRequestorId: userDocuments[0].id });

  expect(res.statusCode).toBe(200);
  const retrievedConnections = Object.values(res.body) as IUserConnection[];
  expect(retrievedConnections[0].userId).toBe(userDocuments[1].id);
  expect(retrievedConnections[1].userId).toBe(userDocuments[2].id);
  done();
});

test(`GET /users/me/connections 
- using 'me' as id, expect a 404 error since 
req.user will be invalid`, async (done)=> {
  const fakeUserId = mongoose.Types.ObjectId();
  const res = await request.get("/users/me/connections")
    .send({ testRequestorId: fakeUserId });
  expect(res.statusCode).toBe(404);
  done();
});

test(`GET /users/:id/connections test for 404 - 
valid format of Id, but not found`, async (done)=> {
  const fakeUserId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${fakeUserId}/connections`)
    .send({ testRequestorId: fakeUserId });
  expect(res.statusCode).toBe(404);
  done();
});

test(`GET /users/:id/connections test for 500 - invalid monogoose id`, async (done)=> {
  const fakeId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${fakeId}1/connections`);
  expect(res.statusCode).toBe(500);
  done();
});

test(`GET /users/:id/threads 
:id is not provided - expect a 400`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.get(`/users/ /threads`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`GET /users/:id/threads 
:id is me - expect threads and a 200 response`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  // Create some test threads
  await testUsers[0].createAndPostThread({
    html: "butterflies are free to fly",
    visibility: ThreadVisibility.Anyone,
  });
  await testUsers[0].createAndPostThread({
    html: "why do they fly away, leaving me to carry on and wonder why",
    visibility: ThreadVisibility.Connections,
  });
  await testUsers[0].createAndPostThread({
    html: "when you knew I was always on your side",
    visibility: ThreadVisibility.Connections,
  });
  const res = await request.get(`/users/me/threads`)
    .send({ testRequestorId: testUsers[0].id });

  expect(res.body.id).toBe(testUsers[0].id);
  const threadObjects = Object.values(Object.values(res.body.threads)[0]);
  expect(threadObjects.length).toBe(3);
  expect(threadObjects[0].content.html).toBe("butterflies are free to fly");
  expect(threadObjects
    .every((threadObject) => threadObject.postedByUserId === testUsers[0].id ))
    .toBe(true);
  expect(res.statusCode).toBe(200);
  done();
});

test(`GET /users/:id/threads
- id is not found in db
- expect 404`, async (done)=> {
  const testUsers = await createTestUsersInDB(2);
  const fakeId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${fakeId}/threads`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(404);
  done();
});

test(`GET /users/:id/threads
- id is valid
- getting other users threads (not a connection)
- expect 200`, async (done)=> {
  const testUsers = await createTestUsersInDB(2);
  await testUsers[1].createAndPostThread({
    html: "through a glass darkly",
    visibility: ThreadVisibility.Anyone,
  });
  await testUsers[1].createAndPostThread({
    html: "if I live to see the seven wonders, I'll make a path to the rainbow's end",
    visibility: ThreadVisibility.Connections,
  });
  await testUsers[1].createAndPostThread({
    html: "wars and rumors of wars",
    visibility: ThreadVisibility.Connections,
  });
  const res = await request.get(`/users/${testUsers[1].id}/threads`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(200);
  const threadObjects = Object.values(Object.values(res.body.threads)[0]);
  expect(threadObjects.length).toBe(1);
  expect(threadObjects[0].content.html).toBe("through a glass darkly");
  expect(threadObjects
    .every((threadObject) => threadObject.postedByUserId === testUsers[1].id ))
    .toBe(true);
  expect(res.body.id).toBe(testUsers[1].id);
  expect(res.statusCode).toBe(200);
  done();
});

test(`GET /users/:id/threads
- id is not found in db
- expect 404`, async (done)=> {
  const testUsers = await createTestUsersInDB(2);
  const fakeId = mongoose.Types.ObjectId();
  const res = await request.get(`/users/${fakeId}/threads`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(404);
  done();
});

test(`GET /users/:id/threads
- id is valid
- getting other users threads (user is connection)
- expect 200
- expect to see private threads too`, async (done)=> {
  const testUsers = await createTestUsersInDB(2);
  await testUsers[1].addConnectionToUser(testUsers[0].id);
  await testUsers[1].createAndPostThread({
    html: "through a glass darkly",
    visibility: ThreadVisibility.Anyone,
  });
  await testUsers[1].createAndPostThread({
    html: "if I live to see the seven wonders, I'll make a path to the rainbow's end",
    visibility: ThreadVisibility.Connections,
  });
  await testUsers[1].createAndPostThread({
    html: "wars and rumors of wars",
    visibility: ThreadVisibility.Connections,
  });
  const res = await request.get(`/users/${testUsers[1].id}/threads`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(200);
  const threadObjects = Object.values(Object.values(res.body.threads)[0]);
  expect(threadObjects.length).toBe(3);
  expect(threadObjects[0].content.html).toBe("through a glass darkly");
  expect(threadObjects[2].content.html).toBe("wars and rumors of wars");
  expect(threadObjects
    .every((threadObject) => threadObject.postedByUserId === testUsers[1].id ))
    .toBe(true);
  expect(res.body.id).toBe(testUsers[1].id);
  expect(res.statusCode).toBe(200);
  done();
});

test(`GET /users/me/notifications`, async (done) => {
  const testUsers = await createTestUsersInDB(3);

  // Create some notification requests
  await NotificationModel.generateNotificationDocument(
    {
      originatorId: testUsers[1].id,
      targetUserId: testUsers[0].id,
      notificationType: NotificationType.ConnectionRequest,
    },
  );
  await NotificationModel.generateNotificationDocument(
    {
      originatorId: testUsers[2].id,
      targetUserId: testUsers[0].id,
      notificationType: NotificationType.ConnectionRequest,
    },
  );

  const res = await request.get(`/users/me/notifications`)
    .send({ testRequestorId: testUsers[0].id });

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(2);
  console.log("notifications", res.body);
  done();
});
