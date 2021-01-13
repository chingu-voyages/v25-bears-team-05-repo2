import { createDummyPublicThreads } from "./thread-test-helper";
import mongoose from "mongoose";

describe("dummy threads helper tests", () => {
  test("returns correct number with correct id", () => {
    const testId = mongoose.Types.ObjectId();
    const results = createDummyPublicThreads(5, testId.toString());
    expect(results).toHaveLength(5);
    expect(results.every((result) => {
      return result.postedByUserId.toString() === testId.toString();
    }));
  });
});
