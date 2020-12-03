import { IUserConnection } from "../user-connection/user-connection.types";
import { UserModel } from "./user.model";
import { IUserDocument } from "./user.types";

/**
 *  Adds a connection object to user's profile and updates the connectionOf property
 * on the target.
 * @param this *
 * @param objId object id
 */
export async function addConnectionToUser (this: IUserDocument, objId: string, isTeamMate?: boolean): Promise<IUserDocument> {
  // This assumes we already have the home user document in context with "this"
  try {
    const targetUser = await UserModel.findById(objId);
    if (targetUser) {
      const targetUserConnection = transformUserDataToConnection(targetUser, isTeamMate); // Adds to originator's connections object
      const originatorConnection = transformUserDataToConnection(this, isTeamMate); // Adds to target;s connectionsOf object

      this["connections"][targetUser._id] = targetUserConnection;
      targetUser["connectionOf"][this._id] = originatorConnection;

      this.markModified("connections");
      targetUser.markModified("connectionOf");
      // Saves the changes
      await this.save();
      await targetUser.save();
      return targetUser;
    } else {
      throw new Error("User id not found");
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Removes connection from user and any subsequent users affected.
 * @param this
 * @param objId
 */
export async function deleteConnectionFromUser(this: IUserDocument, objId: string): Promise<IUserDocument> {
  try {
    const targetUser = await UserModel.findById(objId);
    if (targetUser) {
      delete this["connections"][targetUser._id];
      delete targetUser["connectionOf"][this._id];

      this.markModified("connections");
      targetUser.markModified("connectionOf");

      await this.save();
      await targetUser.save();
      return targetUser;
    } else {
      throw new Error("User id not found");
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 *
 * @param userData A user document to transform
 * @param isTeamMate optional flag to indicate if teammate.
 */
function transformUserDataToConnection(userData: IUserDocument, isTeamMate?: boolean): IUserConnection {
  return {
    firstName: userData.firstName,
    lastName: userData.lastName,
    jobTitle: userData.jobTitle,
    avatar: userData.avatar,
    userId: userData.id.toString(),
    dateTimeConnected: userData.createdAt,
    isTeamMate: isTeamMate || false,
  };
}
