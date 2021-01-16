import { IUser } from "../user.types";
import { encrypt } from "../../../utils/crypto";
/**
 *
 * @param numberOfUsers number of fake users to create for testing.
 */
export function createTestUsers (numberOfUsers: number = 1, googleIds?: Array<string>, plainTextPasswords?: Array<string>): Array<IUser> {
  const fakeUsers: Array<IUser> = [];
  for (let i = 0; i < numberOfUsers; i++) {
    fakeUsers.push({
      firstName: `testUser${i.toString()}FirstName`,
      lastName: `testUser${i.toString()}LastName`,
      jobTitle: `testUser${i.toString()}JobTitle`,
      auth: {
        password: plainTextPasswords && plainTextPasswords[i],
        googleId: googleIds && googleIds[i],
        email: encrypt(`testUser${i.toString()}@test.com`),
      },
      avatarUrls: [ {url: `testUser${i.toString()}AvatarUrl`} ],
      connections: {},
      connectionOf: {},
      threads: {
        started: {},
        commented: {},
        reacted: {},
        forked: {},
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return fakeUsers;
}
