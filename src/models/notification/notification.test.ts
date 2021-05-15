import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createTestUsers } from "../user/user-test-helper/user-test-helper";
import { UserModel } from "../user/user.model";
import { NotificationModel } from "./notification.model";
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

test("creates notification request documents", async () => {
  const testUsers = createTestUsers({ numberOfUsers: 2 });
  const dummyUserDocuments = await UserModel.create(testUsers);
  
});
