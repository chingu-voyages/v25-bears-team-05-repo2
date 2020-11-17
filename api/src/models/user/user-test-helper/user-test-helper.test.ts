import { createTestUsers } from "./user-test-helper";

describe("createTestUsers helper function tests", () => {
  test("create test helpers creates correct amount of test users and the values are formed properly", () => {
    const result = createTestUsers(5);
    expect(result).toHaveLength(5);
    expect(result[1].auth.email).toBe("testUser1@test.com");
    expect(result[4].lastName).toBe("testUser4LastName");
    expect(result[0].avatar[0].url).toBe("testUser0AvatarUrl");
  });
});
