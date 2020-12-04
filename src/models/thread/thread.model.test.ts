import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer: any;

import { ThreadType, ThreadVisibility } from "./thread.types";
import { ThreadModel }  from "./thread.model";
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

describe("CRUD operations for Thread model", () => {
  test("saves and retrieves thread to mongoDB", async () => {
    const sampleId = mongoose.Types.ObjectId();
    const testThreadData = {
      threadType: ThreadType.Article,
      postedByUserId: sampleId,
      visibility: ThreadVisibility.Anyone,
      content: {
        html: "someSampleHTML",
        hashTags: ["#hashTag1", "#hashTag2"],
        attachments: ["a1490dfw4", "b90d*hd*734"],
      },
      comments: {},
      likes: {},
      shares: {}
    };

    const result = await ThreadModel.create(testThreadData);
    expect(result.threadType).toBe(ThreadType.Article);

    expect(result.postedByUserId).toBe(sampleId);
    expect(result.visibility).toBe(ThreadVisibility.Anyone);
    expect(result.content.html).toBe("someSampleHTML");
    expect(result.content.attachments[1]).toBe("b90d*hd*734");
  });
});
