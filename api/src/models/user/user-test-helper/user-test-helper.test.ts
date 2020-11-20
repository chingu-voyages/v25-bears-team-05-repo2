import { createTestUsers } from "./user-test-helper";

describe("createTestUsers helper function tests", () => {
  test("create test helpers creates correct amount of test users and the values are formed properly", () => {
    const result = createTestUsers(5);
    expect(result).toHaveLength(5);
    expect(result[1].auth.email).toBe("testUser1@test.com");
    expect(result[4].lastName).toBe("testUser4LastName");
    expect(result[0].avatar[0].url).toBe("testUser0AvatarUrl");
  });

  test("googleIds are assigned properly with same number of ids as test users", () => {
    const result = createTestUsers(2, ["123", "456"]);
    expect(result[0].auth.googleId).toBe("123");
    expect(result[1].auth.googleId).toBe("456");
  });

  test("googleIds are assigned properly with different number of ids", () => {
    const result = createTestUsers(2, ["123"]);
    expect(result[0].auth.googleId).toBe("123");
    expect(result[1].auth.googleId).toBe(undefined);
  });
});
