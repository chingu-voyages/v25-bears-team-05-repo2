import { IUser } from "../user.types";

/**
 *
 * @param numberOfUsers number of fake users to create for testing
 */
export function createTestUsers (numberOfUsers: number = 1, googleIds?: Array<string>, passwords?: Array<string>): Array<IUser> {

  const fakeUsers: Array<IUser> = [];
  for (let i = 0; i < numberOfUsers; i++) {
    fakeUsers.push({
      firstName: `testUser${i.toString()}FirstName`,
      lastName: `testUser${i.toString()}LastName`,
      auth: {
        password: passwords && passwords[i],
        googleId: googleIds && googleIds[i],
        email: `testUser${i.toString()}@test.com`,
      },
      avatar: [ {url: `testUser${i.toString()}AvatarUrl`} ],
      connections: {},
      connectionOf: {},
      threads: {
        started: {},
        commented: {},
        liked: {},
        shared: {},
      },
    });
  }
  return fakeUsers;
}
