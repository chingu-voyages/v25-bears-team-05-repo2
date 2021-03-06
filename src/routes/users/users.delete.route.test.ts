/* eslint-disable @typescript-eslint/no-var-requires */
const supertest = require("supertest");
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import httpServer from "../../server";
import { createTestUsersInDB } from "../../models/user/user-test-helper/user-test-helper";

import { ErrorObjectCollection, getErrorText } from "../utils";
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

test(`DELETE /users/me/connections/:targetId
 - targetId is missing, expect 400 error`, async (done)=> {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.delete("/users/me/connections/ /")
    .send({ testRequestorId: testUsers[0].id });
  const err = getErrorText(res.error) as ErrorObjectCollection;

  expect(err.errors[0].msg).toBe("Invalid value");
  expect(err.errors[0].param).toBe("targetId");
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /users/me/connections/:targetId
- targetId is reqUserId, expect 400 error`, async (done) => {
  const testUsers = await createTestUsersInDB(1);
  const res = await request.delete(`/users/me/connections/${testUsers[0].id}`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(400);
  expect(getErrorText(res.error))
    .toBe("Can't use 'me' or own id in this type of request");
  done();
});

test(`DELETE /users/me/connections/:targetId
- targetId is not a connection expect 404`, async (done) => {
  const testUsers = await createTestUsersInDB(3);
  const res = await request.delete(`/users/me/connections/${testUsers[2].id}`)
    .send({ testRequestorId: testUsers[0].id });
  expect(getErrorText(res.error)).toBe("User is not a connection");
  expect(res.statusCode).toBe(404);
  done();
});

test(`DELETE /users/me/connections/:targetId
- successfully deletes connection expect 200`, async (done) => {
  const testUsers = await createTestUsersInDB(5);
  await testUsers[0].addConnectionToUser(testUsers[1].id);
  await testUsers[0].addConnectionToUser(testUsers[2].id);
  await testUsers[0].addConnectionToUser(testUsers[3].id);
  const res = await request.delete(`/users/me/connections/${testUsers[1].id}`)
    .send({ testRequestorId: testUsers[0].id });

  const connectionObjects = Object.values(res.body[0]);
  expect(connectionObjects.length).toBe(2);
  expect(connectionObjects.some((obj: any) =>
    obj.userId === testUsers[2].id )).toBe(true);
  expect(res.statusCode).toBe(200);
  done();
});


test(`DELETE /users/me/notifications/:notificationId
- :notificationId is missing
- expect 400 error`, async (done) => {
  const testUser = await createTestUsersInDB(1);
  const res = await request.delete(`/users/me/notifications/ /`)
    .send({ testRequestorId: testUser[0].id });
  expect(res.statusCode).toBe(400);
  done();
});

test(`DELETE /users/me/notifications/:notifications
- the requestor is wrong user
(user attempting to dismiss a 
  notification that doesn't belong to them)`, async (done) => {
  const testUsers = await createTestUsersInDB(3);
  const notificationDocument = await NotificationModel.generateNotificationDocument({
    originatorId: testUsers[1].id,
    targetUserId: testUsers[0].id,
    notificationType: NotificationType.ConnectionRequest,
  });

  const res = await request.delete(`/users/me/notifications/${notificationDocument.id}/`)
    .send({ testRequestorId: testUsers[2].id });
  expect(getErrorText(res.error))
    .toBe("Dismiss notifications: illegal operation - targetId and userId don't match");
  expect(res.statusCode).toBe(500);
  done();
});
test(`DELETE /users/me/notifications/:notifications
- fake notificationId - expect 500 error`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  await NotificationModel.generateNotificationDocument({
    originatorId: testUsers[1].id,
    targetUserId: testUsers[0].id,
    notificationType: NotificationType.ConnectionRequest,
  });
  const fakeNotificationId = mongoose.Types.ObjectId();
  const res = await request.delete(`/users/me/notifications/${fakeNotificationId}/`)
    .send({ testRequestorId: testUsers[0].id });
  expect(getErrorText(res.error))
    .toBe("Unable to find notification by id");
  expect(res.statusCode).toBe(500);
  done();
});

test(`DELETE /users/me/notifications/:notifications
- should dismiss properly`, async (done) => {
  const testUsers = await createTestUsersInDB(2);
  const notification = await NotificationModel.generateNotificationDocument({
    originatorId: testUsers[1].id,
    targetUserId: testUsers[0].id,
    notificationType: NotificationType.ConnectionRequest,
  });

  const res = await request.delete(`/users/me/notifications/${notification.id}/`)
    .send({ testRequestorId: testUsers[0].id });
  expect(res.statusCode).toBe(200);
  done();
});
