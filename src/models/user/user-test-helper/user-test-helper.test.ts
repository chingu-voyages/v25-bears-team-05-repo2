import { createTestUsers } from "./user-test-helper";
import { decrypt } from "../../../utils/crypto";

describe("createTestUsers helper function tests", () => {
  test("create test helpers creates correct amount of test users and the values are formed properly", () => {
    const result = createTestUsers({ numberOfUsers: 5 });
    expect(result).toHaveLength(5);
    expect(decrypt(result[1].auth.email)).toBe("testUser1@test.com");
    expect(result[4].lastName).toBe("testUser4LastName");
    expect(result[0].avatar[0].url).toBe("testUser0AvatarUrl");
  });

  test("googleIds are assigned properly with same number of ids as test users", () => {
    const result = createTestUsers({ numberOfUsers: 2, googleIds: ["123", "456"]});
    expect(result[0].auth.googleId).toBe("123");
    expect(result[1].auth.googleId).toBe("456");
  });

  test("googleIds are assigned properly with different number of ids", () => {
    const result = createTestUsers({ numberOfUsers: 2, googleIds: ["123"]});
    expect(result[0].auth.googleId).toBe("123");
    expect(result[1].auth.googleId).toBe(undefined);
  });

  test("encrypted passwords are retrieved properly from test users", () => {
    const result = createTestUsers({ numberOfUsers: 2,
      googleIds: ["google_id1", "google_id2"],
      plainTextPasswords: ["password1", "password2"]});
    expect(result[0].auth.password).toBe("password1");
  });
});
