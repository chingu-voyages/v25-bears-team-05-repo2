import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createTestUsers } from "../user/user-test-helper/user-test-helper";
import { UserModel } from "../user/user.model";
import { NotificationModel } from "./notification.model";
import { NotificationType } from "./notification.types";
let mongoServer: any;
const options: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};
beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, options, (err) => {
    if (err) console.error(err);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("notification request tests", () => {
  test("creates notification request documents", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    const notification = await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ConnectionRequest,
    });

    // Test that the notification has been saved to its own collection
    const testNotificationDocument = await NotificationModel.findById(
      notification.id,
    );
    expect(testNotificationDocument).toBeDefined();
    expect(testNotificationDocument.message).toBe(
      "testUser0FirstName testUser0LastName would like to add you as a connection",
    );
    expect(testNotificationDocument.read).toBe(false);
    expect(testNotificationDocument.type).toBe(NotificationType.ConnectionRequest);

    // Test that the notification has been saved on target user's document
    const testTargetUser = await UserModel.findById(dummyUserDocuments[1].id);
    expect(
      testTargetUser.notifications.includes(testNotificationDocument.id),
    ).toBe(true);
  });

  test("targetUser is invalid, should throw", async () => {
    const testUsers = createTestUsers({ numberOfUsers: 1 });
    const dummyUserDocuments = await UserModel.create(testUsers);

    await expect(() => NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: "60afee4f605e4156dd1a5246",
      notificationType: NotificationType.ConnectionRequest,
    })).rejects.toThrow();
  });

  test("generates DM notification type with correct properties", async ()=> {
    const testUsers = createTestUsers({ numberOfUsers: 2 });
    testUsers[0].firstName = "David";
    testUsers[0].lastName = "Borg";
    testUsers[1].firstName = "Ella";
    testUsers[1].lastName = "Fit";
    const dummyUserDocuments = await UserModel.create(testUsers);

    const connectionNotification = await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.DirectMessage,
    });

    const connectionNotification2 = await NotificationModel.generateNotificationDocument({
      originatorId: dummyUserDocuments[0].id,
      targetUserId: dummyUserDocuments[1].id,
      notificationType: NotificationType.ThreadReply,
    });

    expect(connectionNotification.message)
      .toBe("David Borg sent you a direct message");
    expect(connectionNotification.link).toBe("placeholder");
    expect(connectionNotification2.message)
      .toBe("David Borg replied to a thread you posted");
    expect(connectionNotification2.link).toBe("placeholder");
  });
  describe("mark as read tests", () => {
    test("mark as read updates the db properly", async () => {
      const testUsers = createTestUsers({ numberOfUsers: 2 });
      const dummyUserDocuments = await UserModel.create(testUsers);

      const firstTestNotification =
        await NotificationModel.generateNotificationDocument({
          originatorId: dummyUserDocuments[0].id,
          targetUserId: dummyUserDocuments[1].id,
          notificationType: NotificationType.ConnectionRequest,
        });
      const markedAsReadNotification =
        await NotificationModel
          .findByIdAndMarkAsRead({ notificationId: firstTestNotification.id,
            read: true });
      expect(markedAsReadNotification.read).toBe(true);
    });
  });
});
