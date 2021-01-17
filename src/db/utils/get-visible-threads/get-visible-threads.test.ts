import mongoose from "mongoose";
import { createTestUsers } from "../../../models/user/user-test-helper/user-test-helper";
import { IThreadReference, ThreadVisibility } from "../../../models/thread/thread.types";
import { getVisibleThreads } from "./get-visible-threads";

describe("getVisibleThread db tests", () => {
  test("correctly excludes the threads visible to only connections", () => {
    // Create some sample thread objects
    const dummyUser = createTestUsers(1, [undefined]);
    dummyUser[0].threads.started = {
      "thread_1": {
        threadId: mongoose.Types.ObjectId(),
        visibility: ThreadVisibility.Anyone,
        createdAt: new Date(),
        updatedAt: new Date(),
        contentSnippet: "sample-html-1",
        postedByUserId: mongoose.Types.ObjectId(),
      } as IThreadReference,
      "thread_2": {
        threadId: mongoose.Types.ObjectId(),
        visibility: ThreadVisibility.Connections,
        createdAt: new Date(),
        updatedAt: new Date(),
        contentSnippet: "sample-html-2",
        postedByUserId: mongoose.Types.ObjectId(),
      } as IThreadReference,
      "thread_3": {
        threadId: mongoose.Types.ObjectId(),
        visibility: ThreadVisibility.Anyone,
        createdAt: new Date(),
        updatedAt: new Date(),
        contentSnippet: "sample-html-3",
        postedByUserId: mongoose.Types.ObjectId(),
      } as IThreadReference,
      "thread_4": {
        threadId: mongoose.Types.ObjectId(),
        visibility: ThreadVisibility.Connections,
        createdAt: new Date(),
        updatedAt: new Date(),
        contentSnippet: "sample-html-4",
        postedByUserId: mongoose.Types.ObjectId(),
      } as IThreadReference
    };

    const result = getVisibleThreads(dummyUser[0].threads);
    expect(result.started["thread_1"]).toBeDefined();
    expect(result.started["thread_1"].visibility).toBe(ThreadVisibility.Anyone);
    expect(result.started["thread_2"]).not.toBeDefined();
    expect(result.started["thread_3"]).toBeDefined();
  });
});
