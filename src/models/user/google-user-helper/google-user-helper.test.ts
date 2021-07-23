import { IGoogleOauthProfile } from "../../../types/google-oath-profile";
import { decrypt } from "../../../utils/crypto";
import { createUserFromGoogleData } from "./google-user-helper";

describe("google user helper convenience method tests", ()=> {
  test("creates user with correct properties and values", ()=> {
    const userData: IGoogleOauthProfile = {
      id: "4f2c0293-c285-56bf-9034-0750900fa771",
      displayName: "John Doe",
      name: {
        familyName: "Doe",
        givenName: "John",
      },
      emails: [
        {
          value: "test1_email@example.com",
          verified: true,
        },
        {
          value: "test2_email@example.com",
          verified: true,
        },
      ],
      photos: [{
        value: "https://springer.com/profile.bmp",
      }],
      provider: "",
      accessToken: "1138aa53-3df5-520d-902f-12a2564feebb",
    };
    const res = createUserFromGoogleData(userData);
    expect(decrypt(res.auth.email)).toBe("test1_email@example.com");
    expect(res.firstName).toBe("John");
    expect(res.lastName).toBe("Doe");
    expect(res.auth.googleId).toBe("4f2c0293-c285-56bf-9034-0750900fa771");
    expect(res.auth.oauth).toBe("1138aa53-3df5-520d-902f-12a2564feebb");
    expect(res.avatar).toHaveLength(1);
    expect(res.threads.shared).toEqual({});
  });
});
