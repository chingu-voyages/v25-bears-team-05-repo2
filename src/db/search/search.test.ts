import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";
import { getUserSearchResults } from "./search.user";
import { ThreadVisibility } from "../../models/thread/thread.types";
import { queryPrivateThreads, queryPublicThreads } from "./search.threads";
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

describe("search results tests", () => {
  test("users search results are accurate", async() => {
    // Create a bunch of test users
    const testUsers = createTestUsers({ numberOfUsers: 10 });
    testUsers[0].firstName = "Joe";
    testUsers[0].lastName = "Smith";
    testUsers[1].firstName = "Anna";
    testUsers[1].lastName = "Philaxis";
    testUsers[2].firstName = "Raj";
    testUsers[2].lastName = "Singh";
    testUsers[3].firstName = "Mona";
    testUsers[3].lastName = "Lisa";
    testUsers[4].firstName = "Ben";
    testUsers[4].lastName = "Ghazi";
    testUsers[5].firstName = "Sharon";
    testUsers[5].lastName = "Needles";
    testUsers[6].firstName = "Ru";
    testUsers[6].lastName = "Paul";
    testUsers[7].firstName = "Daniel";
    testUsers[7].lastName = "Smith";
    testUsers[7].jobTitle = "Automation Engineer";
    await UserModel.create(testUsers);

    const query1 = await getUserSearchResults({  query: "xaul" });
    const query2 = await getUserSearchResults({  query: "Paul"});
    const query3 = await getUserSearchResults({  query: "Smith"});
    const query4 = await getUserSearchResults({  query: "engineer automation"});
    const query5 = await getUserSearchResults({  query: "NeeDles sharon awesome"});
    expect(query1.length).toBe(0);
    expect(query2.length).toBe(1);
    expect(query2[0].lastName).toBe("Paul");
    expect(query3.length).toBe(2);
    expect(query3[0].firstName).toBe("Daniel");
    expect(query3[1].firstName).toBe("Joe");
    expect(query4.length).toBe(1);
    expect(query4[0].jobTitle).toBe("Automation Engineer");
    expect(query5.length).toBe(1);
    expect(query5[0].firstName).toBe("Sharon");
  });

  test("main thread public posts (comments not included)", async() => {
    const testUsers = createTestUsers({ numberOfUsers: 10 });
    const userDocuments = await UserModel.create(testUsers);

    await userDocuments[0].addConnectionToUser(userDocuments[1].id.toString(), true);

    await userDocuments[0].createAndPostThread({ html: "butterflies are free to fly!",
    visibility: ThreadVisibility.Anyone});
    await userDocuments[0].createAndPostThread({ html: "one may fly over the cuckoo's nest",
    visibility: ThreadVisibility.Anyone});
    await userDocuments[1].createAndPostThread({ html: "why do they fly away? disney",
    visibility: ThreadVisibility.Anyone});
    await userDocuments[1].createAndPostThread({ html: "You and I were meant to fly",
    visibility: ThreadVisibility.Connections});


    await userDocuments[0].createAndPostThread({
      html: "What an amazing story about an amazing person. This story talked about all the bad times and all the great accomplishments Walt Disney did in his wonderful life, there is a lot of wonderful information about him as a young person and how he came from nothing to becoming the king of Disneyland."});

    const query1 = await queryPublicThreads({ queryString: "fly" });
    const query2 = await queryPublicThreads({ queryString: "WaLt disnEy!" });
    expect(query1.length).toBe(3);
    expect(query2.length).toBe(2);
  });

  describe("search results for private posts", () => {
    test("gets correct private posts based on a query", async() => {
      const testUsers = createTestUsers({ numberOfUsers: 5 });
      const userDocuments = await UserModel.create(testUsers);

      await userDocuments[4].createAndPostThread({ html: "Nothing is so necessary for a young man",
      visibility: ThreadVisibility.Connections});

      await userDocuments[4].createAndPostThread({ html: "There are more things in heaven and earth, Heratio,",
      visibility: ThreadVisibility.Connections});
      await userDocuments[4].createAndPostThread({ html: "There once was something worthy bah!",
      hashTags: ["apples", "plumbing"],
      visibility: ThreadVisibility.Connections});

      await userDocuments[4].addConnectionToUser(userDocuments[0].id.toString());
      await userDocuments[4].addConnectionToUser(userDocuments[1].id.toString());

      const result1 = await queryPrivateThreads({ requestorUserId: userDocuments[0].id.toString(), queryString: "heratio" });
      const result2 = await queryPrivateThreads({ requestorUserId: userDocuments[4].id.toString(), queryString: "young man"});
      const result3 = await queryPrivateThreads({ requestorUserId: userDocuments[1].id.toString(), queryString: "plumbing" });
      expect(result1.length).toBe(1);
      expect(result1[0].content.html).toBe("There are more things in heaven and earth, Heratio,");
      expect(result2.length).toBe(0);
      expect(result3.length).toBe(1);
  });
  });
});
