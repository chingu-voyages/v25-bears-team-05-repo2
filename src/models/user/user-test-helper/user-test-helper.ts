import { IUser } from "../user.types";
import { encrypt } from "../../../utils/crypto";
import assert from "assert";
/**
 *
 * @param numberOfUsers number of fake users to create for testing.
 */
export function createTestUsers (input: { numberOfUsers: number,
  googleIds?: Array<string>,
  plainTextPasswords?: Array<string>}): Array<IUser> {
  assert(input.numberOfUsers > 0, "number of users must be greater than 0");

  const fakeUsers: Array<IUser> = [];
  for (let i = 0; i < input.numberOfUsers; i++) {
    fakeUsers.push({
      firstName: `testUser${i.toString()}FirstName`,
      lastName: `testUser${i.toString()}LastName`,
      jobTitle: `testUser${i.toString()}JobTitle`,
      auth: {
        password: input.plainTextPasswords && input.plainTextPasswords[i],
        googleId: input.googleIds && input.googleIds[i],
        email: encrypt(`testUser${i.toString()}@test.com`),
      },
      avatar: [ { url: `testUser${i.toString()}AvatarUrl`} ],
      connections: { },
      connectionOf: { },
      threads: {
        started: { },
        commented: { },
        liked: { },
        shared: { },
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return fakeUsers;
}
