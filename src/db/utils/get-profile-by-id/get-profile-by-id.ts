import { UserModel } from "../../../models/user/user.model";
import { IProfile } from "../../../db/types";
/**
 * Finds user by ID and only returns relevant properties
 * @param {string} userId
 */
export async function getProfileById(userId: string): Promise<IProfile> {
  const result = await UserModel.findById(userId);
  if (!result) throw new Error("Unable to find profile for id");

  return {
    firstName: result.firstName,
    lastName: result.lastName,
    jobTitle: result.jobTitle,
    avatar: result.avatar,
    connections: result.connections,
    connectionRequests: result.connectionRequests || {},
    threads: result.threads,
    id: result._id.toString(),
  };
}
