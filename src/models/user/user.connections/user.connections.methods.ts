/* eslint-disable max-len */
/* eslint-disable no-invalid-this */
import { IUserConnection } from "../../user-connection/user-connection.types";
import { UserModel } from "../user.model";
import { IUserDocument } from "../user.types";
import isEmpty from "lodash/isEmpty";
/**
 *  Adds a connection object to user's profile and updates the connections property
 * on the target.
 * @param {object} this the source users to which we add the connection
 * @param {string} objId object id id of user to add to the source user's connections object
 * @param {boolean} isTeamMate indicates if team mate
 * @return {Promise<IUserDocument>}
 */
export async function addConnectionToUser(
  this: IUserDocument,
  objId: string,
  isTeamMate?: boolean,
): Promise<IUserDocument> {
  const targetUser = await UserModel.findById(objId);
  if (targetUser) {
    const targetUserConnection = transformUserDataToConnection(
      targetUser,
      isTeamMate,
    ); // Adds to originator's connections object
    const originatorConnection = transformUserDataToConnection(
      this,
      isTeamMate,
    ); // Adds to target;s connectionsOf object

    if (this["connections"][targetUser._id]) {
      throw new Error(
        ` Target user ${targetUser._id} already exists in ${this._id} connections object`,
      );
    }

    if (targetUser["connections"][this._id]) {
      throw new Error(
        `${this._id} already exists in ${targetUser._id} connections object`,
      );
    }

    this["connections"][targetUser._id] = targetUserConnection;
    targetUser["connections"][this._id] = originatorConnection;

    this.markModified("connections");
    targetUser.markModified("connections");

    await this.save();
    await targetUser.save();
    return targetUser;
  } else {
    throw new Error("User id not found");
  }
}

/**
 * Removes connection from user and any subsequent users affected.
 * @param {object} this
 * @param {string} objId
 */
export async function deleteConnectionFromUser(
  this: IUserDocument,
  objId: string,
): Promise<IUserDocument> {
  if (!this["connections"][objId]) {
    throw new Error(`User is not a connection`);
  }
  delete this["connections"][objId];
  const targetUser = await UserModel.findById(objId);
  if (targetUser) {
    delete targetUser["connections"][this._id];
    this.markModified("connections");
    targetUser.markModified("connections");
    await this.save();
    await targetUser.save();
    return targetUser;
  } else {
    throw new Error("User id not found");
  }
}

/**
 * Goes through source the connectionsOf object of the source user's connections.
 * @param {object} this instance of user making the request
 */
export async function getSecondTierConnections(
  this: IUserDocument,
): Promise<IUserConnection[]> {
  // Get an array of userIds for this.connections
  const connectionUserIds = Object.keys(this.connections);

  // Find user documents that match the ids in the above array
  const users = await UserModel.find()
    .where("_id")
    .in(connectionUserIds)
    .exec();
  const connectionsOf: IUserConnection[] = [];
  const uniqueIds: any = {};
  users.forEach((user) => {
    for (const [_, value] of Object.entries(user.connections)) {
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
 *  Returns an array of IUserDocuments representing the users in the "connections" object
 * on the source user
 * @param {object} this instance of IUserDocument
 */
export async function getUserDocumentsFromConnections(
  this: IUserDocument,
): Promise<IUserDocument[]> {
  if (!this.connections || isEmpty(this.connections)) {
    return [];
  }

  const connectionsUserIds = Object.keys(this.connections);
  return UserModel.find().where("_id").in(connectionsUserIds).exec();
}

/**
 *
 * @param {IUserDocument} userData A user document to transform
 * @param {boolean} isTeamMate optional flag to indicate if teammate.
 * @return {IUserConnection}
 */
function transformUserDataToConnection(
  userData: IUserDocument,
  isTeamMate?: boolean,
): IUserConnection {
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
