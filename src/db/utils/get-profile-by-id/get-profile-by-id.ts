import { UserModel } from "../../../models/user/user.model";
import { IProfile } from "../../../db/types";
/**
 * Finds user by ID and only returns relevant properties
 * @param userId ObjectId
 */
export async function getProfileById({userId, reqUserId}: {userId: string, reqUserId: string}): Promise<IProfile> {
  const result = await UserModel.findById(userId);
  if (!result) throw new Error(`Unable to find profile for id: ${userId}`);

  return {
    id: result._id.toString(),
    firstName: result.firstName,
    lastName: result.lastName,
    jobTitle: result.jobTitle,
    avatarUrls: result.avatarUrls,
    nOfConnections: Object.keys(result.connections).length, 
    isAConnection: Object.keys(result.connectionOf).includes(reqUserId),
    connections: result.connections,
    connectionOf: result.connectionOf,
    threads: result.threads,
    isCurrentUser: userId === reqUserId,
  };
}
