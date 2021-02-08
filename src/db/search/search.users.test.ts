import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { UserModel } from "../../models/user/user.model";
import { getUserSearchResults } from "./search.users";
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

describe("user search query tests", () => {
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
});
