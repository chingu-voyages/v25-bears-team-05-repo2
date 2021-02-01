import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;
import { UserModel } from "./user.model";
import { createTestUsers } from "./user-test-helper/user-test-helper";
import { IUserRegistrationDetails } from "./user.types";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "../../utils/crypto";

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

describe("CRUD operations for User model", () => {
  test("successfully saves and retrieves user to mongo database", async () => {
    const testUserData = {
      firstName: "testFirstName",
      lastName: "testLastName",
      auth: {
        email: encrypt("test@test.com"),
      },
      avatarUrls: [ {url: "testUrl01"} ],
      connections: {},
      connectionOf: {},
      threads: {
        started: {},
        commented: {},
        reacted: {},
        forked: {},
      }
    };
    const result = await UserModel.create(testUserData);
    expect(decrypt(result.auth.email)).toBe("test@test.com");
    expect(result.lastName).toBe("testLastName");
    expect(result.avatarUrls[0].url).toBe("testUrl01");
  });

  test("findOrCreate function returns user if found", async () => {
    const [user1, user2] = createTestUsers({ numberOfUsers: 2, googleIds: ["123456789", "987654321", "55544323"]});
    // Put the test models in the collection.
    await UserModel.create([user1, user2]);
    const result = await UserModel.findOneOrCreateByGoogleId(user1);
    expect(result.auth.googleId).toBe("123456789");
  });

  test("creates user in db if not found", async () => {
    const [user1, user2] = createTestUsers({ numberOfUsers: 2,  googleIds: ["123456789", "987654321"]});
    // Put the test document in the collection.
    await UserModel.create(user1);
    const result = await UserModel.findOneOrCreateByGoogleId(user2);
    expect(result.auth.googleId).toBe("987654321");
  });

  test("find user by googleId method retrieves a user", async() => {
    // Create test users and put them in db
    const [user1, user2] = createTestUsers({ numberOfUsers: 2, googleIds: ["123456789", "987654321"]});
    await UserModel.create([user1, user2]);

    // Test the find by google id function
    const result = await UserModel.findByGoogleId("123456789");
    expect(result).toBeDefined();
    expect(result.auth.googleId).toBe("123456789");
    expect(result.auth.googleId).not.toBe("1234567891");
  });
});

describe("register user tests", () => {
  test("register user function throws error if duplicate email address", async() => {
    const testUsers = createTestUsers({ numberOfUsers: 3,
      googleIds: [],
      plainTextPasswords: ["password0", "password1", "password2"]});
    await UserModel.create(testUsers);

    const newTestUser: IUserRegistrationDetails = {
      firstName: "testUser0FirstName",
      lastName: "testUser0LastName",
      encryptedEmail: encrypt("testUser0@test.com"),
      plainTextPassword: "somePwd",
    };
    await expect(() => UserModel.registerUser(newTestUser)).rejects.toThrow();
  });

  test("register user function does not throw if unique e-mail", async() => {
    const testUsers = createTestUsers({ numberOfUsers: 3,
      googleIds: [],
      plainTextPasswords: ["password0", "password1", "password2"]});
    await UserModel.create(testUsers);

    const newTestUser: IUserRegistrationDetails = {
      firstName: "testUser0FirstName",
      lastName: "testUser0LastName",
      encryptedEmail: encrypt("testUser5@test.com"),
      plainTextPassword: "somePwd",
    };
    await expect(() => UserModel.registerUser(newTestUser)).resolves;
  });

  test("registers user into database and info is stored properly", async () => {
    const newTestUser: IUserRegistrationDetails = {
      firstName: "Mary-Beth",
      lastName: "Evans",
      encryptedEmail: encrypt("drkaylabrady@email.com"),
      plainTextPassword: "somePwd",
    };

    const newUser = await UserModel.registerUser(newTestUser);
    expect(decrypt(newUser.auth.email)).toBe("drkaylabrady@email.com");
    expect(newUser.firstName).toBe("Mary-Beth");

    const passwordMatches = await bcrypt.compare("somePwd", newUser.auth.password);
    expect(passwordMatches).toBe(true);
  });
});
