/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";
import { ErrorObjectCollection, getErrorText } from "../utils";
import { NotificationModel } from "../../models/notification/notification.model";
import { INotificationDocument,
  NotificationType } from "../../models/notification/notification.types";

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

test(`PATCH /users/me/notifications/:notificationId
- Mark notification as read tests
- :notificationId is missing, 
- read is missing (and is not boolean) from req.body expect 400 error`, async (done) => {
  const testUser = await createTestUsersInDB(1);
  const res = await request.patch(`/users/me/notifications/ /`)
    .send({ testRequestorId: testUser[0].id });

  const errorObjects = (getErrorText(res.error) as ErrorObjectCollection)
    .errors;
  expect(errorObjects).toHaveLength(3);
  expect(errorObjects[0].location).toBe("params");
  expect(errorObjects[1].param).toBe("read");
  expect(errorObjects[2].msg).toBe("Invalid value");
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /users/me/notifications/:notificationId
- Mark notification as read tests
- :notificationId is fake (not found in DB), 
- read is missing (and is not boolean) from req.body
- expect 400 error`, async (done) => {
  const testUser = await createTestUsersInDB(1);
  const fakeNotificationId = mongoose.Types.ObjectId();
  const res = await request.patch(`/users/me/notifications/${fakeNotificationId}/`)
    .send({ testRequestorId: testUser[0].id });

  const errorObjects = (getErrorText(res.error) as ErrorObjectCollection)
    .errors;
  expect(errorObjects).toHaveLength(2);
  expect(errorObjects[0].location).toBe("body");
  expect(errorObjects[0].msg).toBe("Invalid value");
  expect(errorObjects[1].param).toBe("read");
  expect(res.statusCode).toBe(400);
  done();
});

test(`PATCH /users/me/notifications/:notificationId
- Mark notification as read tests
- :notification ID is correct, 
- read correctly set in req.body
- req.user is not the target (The targetUserId doesn't match the notification's targetUser)
- expect 404`, async (done) => {
  const testUser = await createTestUsersInDB(3);
  const notification = await NotificationModel.generateNotificationDocument({
    originatorId: testUser[0].id,
    targetUserId: testUser[1].id,
    notificationType: NotificationType.ConnectionRequest,
  });
  const fakeReqUser = mongoose.Types.ObjectId();
  const res = await request.patch(`/users/me/notifications/${notification.id}/`)
    .send({ testRequestorId: fakeReqUser, read: true });

  expect(getErrorText(res.error))
    .toBe("The targetUserId doesn't match the notification's targetUser");
  expect(res.statusCode).toBe(404);
  done();
});

test(`PATCH /users/me/notifications/:notificationId
- expect 200 with valid data`, async (done) => {
  const testUser = await createTestUsersInDB(4);
  await NotificationModel.generateNotificationDocument({
    originatorId: testUser[0].id,
    targetUserId: testUser[1].id,
    notificationType: NotificationType.ConnectionRequest,
  });
  await NotificationModel.generateNotificationDocument({
    originatorId: testUser[2].id,
    targetUserId: testUser[1].id,
    notificationType: NotificationType.ConnectionRequest,
  });
  const notification = await NotificationModel.generateNotificationDocument({
    originatorId: testUser[3].id,
    targetUserId: testUser[1].id,
    notificationType: NotificationType.ConnectionRequest,
  });
  const res = await request.patch(`/users/me/notifications/${notification.id}/`)
    .send({ testRequestorId: testUser[1].id, read: true });

  const returnedNotificationObjects = res.body as INotificationDocument[];
  expect(returnedNotificationObjects).toHaveLength(3);
  expect(returnedNotificationObjects[2].read).toBe(true);
  expect(res.statusCode).toBe(200);
  done();
});
