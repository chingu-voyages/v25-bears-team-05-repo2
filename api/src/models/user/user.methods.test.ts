import { decrypt, encrypt } from "../../utils/crypto";
import { createTestUsers } from "./user-test-helper/user-test-helper";
import { UserModel } from "./user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
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
  test("Function works", async() => {
    const dummyUsers = createTestUsers(150, undefined, undefined);
    const encryptedEmail = dummyUsers[0].auth.email; // This should be encrypted
    await UserModel.create(dummyUsers);
    const result = await UserModel.findByEncryptedEmail(encryptedEmail);

    expect(result.length).not.toBe(0);
    expect(decrypt(result[0].auth.email)).toBe("testUser0@test.com");
  });
});

describe("findOneByEncryptedEmail function tests", () => {
  test("function returns a single object", async() => {
    const dummyUsers = createTestUsers(10, undefined, undefined);
    const encryptedEmail = dummyUsers[1].auth.email; // This should be encrypted
    await UserModel.create(dummyUsers);
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);

    expect(result).not.toHaveProperty("length");
    expect(result).toBeDefined();
    expect(decrypt(result.auth.email)).toBe("testUser1@test.com");
  });

  test("function returns undefined because no e-mail exists", async () => {
    const dummyUsers = createTestUsers(5, undefined, undefined);
    const encryptedEmail = encrypt("someOtherEmail@test.com");
    await UserModel.create(dummyUsers);
    const result = await UserModel.findOneByEncryptedEmail(encryptedEmail);

    expect(result).toBeUndefined();
  });
});
