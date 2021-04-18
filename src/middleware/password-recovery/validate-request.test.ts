import { createTestUsers } from "../../models/user/user-test-helper/user-test-helper";
import { IUserDocument } from "../../models/user/user.types";
import { isGoogleAuthAccount } from "./validate-request";

const dummyUsers = createTestUsers({
  numberOfUsers: 2,
  googleIds: ["googleId"],
}) as IUserDocument[];

describe("validate request tests", () => {
  test("isGoogleAuth account function works correctly", () => {
    const positiveResult = isGoogleAuthAccount(dummyUsers[0]);
    const negativeResult = isGoogleAuthAccount(dummyUsers[1]);
    expect(positiveResult).toBe(true);
    expect(negativeResult).toBe(false);
  });
});
