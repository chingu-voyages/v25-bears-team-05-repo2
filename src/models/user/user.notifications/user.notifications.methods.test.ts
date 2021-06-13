// import { createTestUsers } from "./user-test-helper/user-test-helper";
// import { UserModel } from "./user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NotificationModel } from "../../notification/notification.model";
import { NotificationType } from "../../notification/notification.types";
import { createTestUsers } from "../user-test-helper/user-test-helper";
import { UserModel } from "../user.model";
let mongoServer: any;

const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

beforeEach(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, options, (err) => {
    if (err) console.error(err);
  });
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User notifications retrieval tests", () => {
  // eslint-disable-next-line max-len
  test("retrieves notification documents based on user's notifications field", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    const firstTestNotification =
      await NotificationModel.generateNotificationDocument({
        originatorId: dummyUserDocuments[0].id,
        targetUserId: dummyUserDocuments[1].id,
        notificationType: NotificationType.ConnectionRequest,
      });
    await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });
    await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });

    const testTargetUser = await UserModel.findById(dummyUserDocuments[1].id);
    expect(testTargetUser.notifications.length).toBe(3);
    expect(testTargetUser.notifications[0]).toBe(firstTestNotification.id);
  });
  test("gets all notifications for target user id", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });
    await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });
    await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });

    const notifications = await dummyUserDocuments[1].getNotifications();
    expect(notifications.length).toBe(3);
    expect(notifications.every((n) => n.targetId === dummyUserDocuments[1].id));
    expect(
      notifications.every((n) => n.originatorId === dummyUserDocuments[0].id),
    );
  });
});

describe("dismiss notification tests", ()=> {
  test("notifications are dismissed correctly", async ()=> {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);
    const notification = await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });

    const targetUser = await UserModel.findById(notification.targetId);
    await targetUser.dismissNotification(notification.id);
    expect(targetUser.notifications.includes(notification.id)).toBe(false);
    expect(targetUser.notifications.length).toBe(0);

    const notificationResult = await NotificationModel.findById(notification.id);
    expect(notificationResult).toBeNull();
  });
});
