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

describe("feed tests", () => {
  describe("getConnectionThreads method tests", () => {
    test("gets threads properly", async() => {
      // Create a few test users
      const testUser = createTestUsers(10, undefined, undefined);
      const dummyUserDocuments = await UserModel.create(testUser);

      // Have the users create random threads
      await dummyUserDocuments[1].createAndPostThread({
        html: "dummy-user-1-thread-1-test", });
      await dummyUserDocuments[1].createAndPostThread({
        html: "dummy-user-1-thread-2-test", });
      await dummyUserDocuments[1].createAndPostThread({
        html: "dummy-user-1-thread-3-test", });
      await dummyUserDocuments[1].createAndPostThread({
        html: "dummy-user-1-thread-4-test", });
      await dummyUserDocuments[2].createAndPostThread({
        html: "dummy-user-2-thread-1-test", });
      await dummyUserDocuments[2].createAndPostThread({
        html: "dummy-user-2-thread-2-test", });
      await dummyUserDocuments[2].createAndPostThread({
        html: "dummy-user-2-thread-3-test"});
      await dummyUserDocuments[3].createAndPostThread({
        html: "dummy-user-3-thread-1-test"});
      await dummyUserDocuments[3].createAndPostThread({
        html: "dummy-user-3-thread-2-test"});


      // Create connections
      await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[1].id);
      await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[2].id);
      await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[3].id);
      await dummyUserDocuments[0].addConnectionToUser(dummyUserDocuments[4].id);

       // Get our threads
      const results = await dummyUserDocuments[0].getConnectionThreads();
      expect(results).toHaveLength(9);
      let numberOfChecks = 0;

      // This check makes sure that the current element's date is more recent than
      // current element + 1 (this verifies the array of threads is sorted by most
      // recent date)
      results.forEach((result, index) => {
        if (results[index + 1]) {
          expect(result.createdAt.valueOf()).toBeGreaterThan(results[index + 1].createdAt.valueOf());
          numberOfChecks += 1;
        }
      });
      expect(numberOfChecks).toBe(8);
    });
  });
});
