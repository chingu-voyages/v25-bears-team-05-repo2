import { decrypt, encrypt } from "../../../utils/crypto";
import { createTestUsers } from "../user-test-helper/user-test-helper";
import { UserModel } from "../user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

describe("find by encrypted email function tests", () => {
  test("Function works", async () => {
    const dummyUsers = createTestUsers({ numberOfUsers: 150 });
    const encryptedEmail = dummyUsers[0].auth.email; // This should be encrypted
    await UserModel.create(dummyUsers);
    const result = await UserModel.findByEncryptedEmail(encryptedEmail);

    expect(result.length).not.toBe(0);
    expect(decrypt(result[0].auth.email)).toBe("testUser0@test.com");
  });
});

describe("findOneByEncryptedEmail function tests", () => {
  test("function returns a single object", async () => {
    const dummyUsers = createTestUsers({ numberOfUsers: 10 });
    const encryptedEmail = dummyUsers[1].auth.email; // This should be encrypted
    await UserModel.create(dummyUsers);
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);

    expect(result).not.toHaveProperty("length");
    expect(result).toBeDefined();
    expect(decrypt(result.auth.email)).toBe("testUser1@test.com");
  });

  test("function returns undefined because no e-mail exists", async () => {
    const dummyUsers = createTestUsers({ numberOfUsers: 5 });
    const encryptedEmail = encrypt("someOtherEmail@test.com");
    await UserModel.create(dummyUsers);
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);

    expect(result).toBeUndefined();
  });
});

describe("change password tests", () => {
  test("changes password correctly", async () => {
    const testUsersDocuments = createTestUsers({
      numberOfUsers: 1,
      plainTextPasswords: ["Somepassword$123"],
    });
    const userDocuments = await UserModel.create(testUsersDocuments);
    expect(userDocuments[0].auth.password).toBe("Somepassword$123");

    await userDocuments[0].changePassword("someNewPassword$123");
    const encryptedEmail = encrypt("testUser0@test.com");
    const updatedUser = await UserModel.findByEncryptedEmail(encryptedEmail);
    expect(bcrypt.compareSync("someNewPassword$123",(updatedUser[0].auth.password))).toBe(true);
    expect(bcrypt.compareSync("someNewPassword$124",(updatedUser[0].auth.password))).toBe(false);
  });
});
