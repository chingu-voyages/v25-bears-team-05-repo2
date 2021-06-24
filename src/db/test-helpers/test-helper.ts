/* eslint-disable require-jsdoc */

import { createTestUsersWithSequentialID,
} from "../../models/user/user-test-helper/user-test-helper";

import { UserModel } from "../../models/user/user.model";

async function dropUsers():Promise<void> {
  await UserModel.collection.drop();
}

async function createUsers():Promise<string[]> {
  const dummyUsers = createTestUsersWithSequentialID({ numberOfUsers: 10 });
  const insertedUsers = await UserModel.create(dummyUsers);
  return insertedUsers.map((user) => user._id);
}
export async function setupTests(): Promise<string[]> {
  await dropUsers();
  return createUsers();
}
