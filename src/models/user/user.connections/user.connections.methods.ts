import { IUserConnection } from "../../user-connection/user-connection.types";
import { UserModel } from "../user.model";
import { IUserDocument } from "../user.types";
import isEmpty from "lodash/isEmpty";
/**
 *  Adds a connection object to user's profile and updates the connectionOf property
 * on the target.
 * @param this *
 * @param objId object id
 */
export async function addConnectionToUser(this: IUserDocument, objId: string, isTeamMate?: boolean): Promise<IUserDocument> {
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
  if (!this["connections"][objId]) {
    throw new Error(`User with Id ${objId} is not a connection`)
  }

  delete this["connections"][objId];

  try {
    const targetUser = await UserModel.findById(objId);
    if (targetUser) {
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
 * Goes through source the connectionsOf object of the source user's connections.
 * @param this instance of user making the request
 */
export async function getConnectionOfFromConnections(this: IUserDocument): Promise<IUserConnection[]> {
  // Get an array of userIds for this.connections
  const connectionUserIds = Object.keys(this.connections);

  // Find user documents that match the ids in the above array
  const users = await UserModel.find().where("_id").in(connectionUserIds).exec();
  const connectionsOf: IUserConnection[] = [];
  const uniqueIds: any = { };
  users.forEach((user) => {
    for (const [_, value] of Object.entries(user.connectionOf)) {
      if (value.userId !== this.id) {
        if (!uniqueIds[value.userId.toString()]) {
          connectionsOf.push(value);
          uniqueIds[value.userId.toString()] = 1;
        }
      }
    }
  });
  return connectionsOf;
}

/**
 *  Returns an array of IUserDocuments representing the users in the "connectionsOf" object
 * on the source user
 * @param this instance of IUserDocument
 */
export async function getUserDocumentsFromSourceUserConnectionOf(this: IUserDocument): Promise<IUserDocument[]> {
  if (!this.connectionOf || isEmpty(this.connectionOf)) {
    return [];
  }

  const connectionOfUserIds = Object.keys(this.connectionOf);
  return await UserModel.find().where("_id").in(connectionOfUserIds).exec();
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

