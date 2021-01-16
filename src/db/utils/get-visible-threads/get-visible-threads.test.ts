import mongoose from "mongoose";
import { createTestUsers } from "../../../models/user/user-test-helper/user-test-helper";
import { IThreadDocument, ThreadType, ThreadVisibility } from "../../../models/thread/thread.types";
import { getVisibleThreads } from "./get-visible-threads";

describe("getVisibleThread db tests", () => {
  test("correctly excludes the threads visible to only connections", () => {
    // Create some sample thread objects
    const dummyUser = createTestUsers(1, [undefined]);
    dummyUser[0].threads.started = {
      "thread_1": {
        postedByUserId: mongoose.Types.ObjectId(),
        threadType: ThreadType.Article,
        visibility: ThreadVisibility.Anyone,
        content: {
          html: "sample-html-1",
          hashTags: [],
          attachments: [],
        },
        comments: { },
        reactions: { },
        forks: { },
        createdAt: new Date(),
        updatedAt: new Date()
      } as IThreadDocument,
      "thread_2": {
        postedByUserId: mongoose.Types.ObjectId(),
        threadType: ThreadType.Article,
        visibility: ThreadVisibility.Connections,
        content: {
          html: "sample-html-2",
          hashTags: [],
          attachments: [],
        },
        comments: { },
        reactions: { },
        forks: { },
        createdAt: new Date(),
        updatedAt: new Date()
      } as IThreadDocument,
      "thread_3": {
        postedByUserId: mongoose.Types.ObjectId(),
        threadType: ThreadType.Article,
        visibility: ThreadVisibility.Anyone,
        content: {
          html: "sample-html-3",
          hashTags: [],
          attachments: [],
        },
        comments: { },
        reactions: { },
        forks: { },
        createdAt: new Date(),
        updatedAt: new Date()
      } as IThreadDocument,
      "thread_4": {
        postedByUserId: mongoose.Types.ObjectId(),
        threadType: ThreadType.Article,
        visibility: ThreadVisibility.Connections,
        content: {
          html: "sample-html-1",
          hashTags: [],
          attachments: [],
        },
        comments: { },
        reactions: { },
        forks: { },
        createdAt: new Date(),
        updatedAt: new Date()
      } as IThreadDocument
    };

    const result = getVisibleThreads(dummyUser[0].threads);
    expect(result.started["thread_1"]).toBeDefined();
    expect(result.started["thread_1"].visibility).toBe(ThreadVisibility.Anyone);
    expect(result.started["thread_2"]).not.toBeDefined();
    expect(result.started["thread_3"]).toBeDefined();
  });
});
